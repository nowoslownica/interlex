import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prismaCorpus } from "@/lib/prisma"
import { checkPermission } from "@/lib/permissions"
import { Feature } from "@/config/features"
import { DbAnalyzer } from "@/lib/corpus/tokenizer/dbAnalyzer"
import { buildValidEndings, createQueryWordsByBase } from "@/lib/corpus/tokenizer/analyzer-factory"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth()
  if (!session || !(await checkPermission(session, Feature.CorpusBuilder))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { slug } = await params

  const doc = await prismaCorpus.corpusDocument.findUnique({ where: { slug } })
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  try {
    const validEndings = await buildValidEndings()
    const analyzer = new DbAnalyzer(createQueryWordsByBase(), validEndings)

    const tokens = await prismaCorpus.corpusToken.findMany({
      where: { documentSlug: slug },
      select: { id: true, surfaceForm: true, wordIndex: true },
    })

    let analyzed = 0
    let failed = 0

    const BATCH_SIZE = 1000
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE)

      await prismaCorpus.$transaction(async (tx) => {
        for (const token of batch) {
          if (token.wordIndex === -1) {
            await tx.corpusToken.updateMany({
              where: { id: token.id, documentSlug: slug },
              data: { pos: "PUNCT", lemma: token.surfaceForm, wordSlug: null, feats: {} },
            })
            continue
          }

          const analysis = await analyzer.analyzeWord(token.surfaceForm)

          if (!analysis) {
            failed++
            await tx.corpusToken.updateMany({
              where: { id: token.id, documentSlug: slug },
              data: { pos: "X", lemma: token.surfaceForm, wordSlug: null, feats: {} },
            })
            continue
          }

          analyzed++
          await tx.corpusToken.updateMany({
            where: { id: token.id, documentSlug: slug },
            data: {
              lemma: analysis.lemma,
              pos: analysis.pos,
              wordSlug: analysis.wordSlug,
              matchCount: analysis.matchCount ?? 0,
              feats: analysis.feats as Record<string, string>,
            },
          })
        }
      })
    }

    await prismaCorpus.corpusDocument.update({
      where: { slug },
      data: {},
    })

    return NextResponse.json({
      ok: true,
      analyzed,
      failed,
      total: tokens.length,
    })
  } catch (error) {
    console.error("Reanalysis failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}