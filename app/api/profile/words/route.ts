import { prismaData as dbData } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { init } from "@/lib/sqlite"
import { fetchTranslationsForMeaningIds } from "@/lib/translations"

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") || ""
  const lang = req.nextUrl.searchParams.get("lang") || "ru"
  const wordIds = ids.split(",").map(Number).filter(Boolean)

  if (!wordIds.length) {
    return NextResponse.json([])
  }

  const words = await dbData.lexeme.findMany({
    where: { id: { in: wordIds } },
    include: {
      meanings: true,
    },
  })

  const meaningIds = words.flatMap(w => w.meanings.map(m => m.id)).filter(Boolean)

  if (meaningIds.length > 0) {
    const db = await init()
    const transByMeaning = fetchTranslationsForMeaningIds(db, meaningIds, [lang])[lang] ?? {}

    for (const word of words) {
      const wordTranslations: string[] = []
      for (const meaning of word.meanings) {
        const entries = transByMeaning[meaning.id]
        if (entries) {
          for (const e of entries) {
            if (e.value) wordTranslations.push(e.value)
          }
        }
      }
      ;(word as any).translation = wordTranslations.join(", ")
    }

    db.close()
  } else {
    for (const word of words) {
      ;(word as any).translation = ""
    }
  }

  return NextResponse.json(words)
}