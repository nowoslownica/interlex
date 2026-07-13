import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prismaLibrary as db } from "@/lib/prisma"
import { Feature } from "@/config/features"
import { requirePermission } from "@/lib/permissions"
import AdminNav from "@/components/AdminNav"
import { prismaAuth as dbAuth } from "@/lib/prisma"
import { buildEntry, append } from "@/lib/action-history"
import { LibraryForm } from "../../new/form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Редактирование текста — библиотека",
  description: "Редактирование текста в библиотеке межславянского языка.",
}

export default async function EditLibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")
  await requirePermission(session, Feature.LibraryManage)

  const entryId = parseInt(id, 10)
  if (isNaN(entryId)) notFound()

  const entry = await db.libraryEntry.findUnique({ where: { id: entryId } })
  if (!entry) notFound()

  const currentEntry = entry

  const userPermissions = session.user.role === "MODERATOR"
    ? (await dbAuth.featurePermission.findMany({
        where: { userId: session.user.id },
        select: { featureKey: true },
      })).map(p => p.featureKey)
    : []

  async function save(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s) throw new Error("Unauthorized")
    await requirePermission(s, Feature.LibraryManage)

    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const author = (formData.get("author") as string) || null
    const category = formData.get("category") as string
    const flavor = (formData.get("flavor") as string) || "CORE"
    const source = (formData.get("source") as string) || null
    const yearRaw = formData.get("yearWritten") as string
    const yearWritten = yearRaw ? parseInt(yearRaw, 10) : null
    const yearTransRaw = formData.get("yearTranslated") as string
    const yearTranslated = yearTransRaw ? parseInt(yearTransRaw, 10) : null
    const translator = (formData.get("translator") as string) || null
    const body = (formData.get("body") as string) || null
    const summary = (formData.get("summary") as string) || null
    const corpusSlug = (formData.get("corpusSlug") as string) || null
    const verified = formData.get("verified") === "on"
    const userEmail = s.user.email || "unknown"

    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (title !== currentEntry.title) changes.title = { old: currentEntry.title, new: title }
    if (slug !== currentEntry.slug) changes.slug = { old: currentEntry.slug, new: slug }
    if (author !== currentEntry.author) changes.author = { old: currentEntry.author, new: author }
    if (category !== currentEntry.category) changes.category = { old: currentEntry.category, new: category }
    if (flavor !== currentEntry.flavor) changes.flavor = { old: currentEntry.flavor, new: flavor }
    if (source !== currentEntry.source) changes.source = { old: currentEntry.source, new: source }
    if (yearWritten !== currentEntry.yearWritten) changes.yearWritten = { old: currentEntry.yearWritten, new: yearWritten }
    if (yearTranslated !== currentEntry.yearTranslated) changes.yearTranslated = { old: currentEntry.yearTranslated, new: yearTranslated }
    if (translator !== currentEntry.translator) changes.translator = { old: currentEntry.translator, new: translator }
    if (body !== currentEntry.body) changes.body = { old: currentEntry.body, new: body }
    if (summary !== currentEntry.summary) changes.summary = { old: currentEntry.summary, new: summary }
    if (corpusSlug !== currentEntry.corpusSlug) changes.corpusSlug = { old: currentEntry.corpusSlug, new: corpusSlug }
    if (verified !== currentEntry.verified) changes.verified = { old: currentEntry.verified, new: verified }

    await db.libraryEntry.update({
      where: { id: entryId },
      data: {
        slug,
        title,
        author,
        category,
        flavor,
        source,
        yearWritten,
        yearTranslated,
        translator,
        body,
        summary,
        corpusSlug,
        verified,
        verifiedBy: verified ? userEmail : null,
        actionHistory: append(currentEntry.actionHistory, buildEntry(userEmail, changes)),
      },
    })
    redirect("/admin/library")
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground transition-colors duration-300">
      <AdminNav userRole={session.user.role || ""} userPermissions={userPermissions} />
      <div className="flex-1 min-h-0 overflow-auto p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-bold mb-6">Редактирование: {currentEntry.title}</h1>
        <LibraryForm
          action={save}
          initial={{
            slug: currentEntry.slug,
            title: currentEntry.title,
            author: currentEntry.author || "",
            category: currentEntry.category,
            flavor: currentEntry.flavor,
            body: currentEntry.body || "",
            summary: currentEntry.summary || "",
            corpusSlug: currentEntry.corpusSlug || "",
            verified: currentEntry.verified,
            source: currentEntry.source || "",
            yearWritten: currentEntry.yearWritten,
            yearTranslated: currentEntry.yearTranslated,
            translator: currentEntry.translator || "",
          }}
        />
      </div>
    </div>
  )
}