import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prismaLibrary as db } from "@/lib/prisma"
import { Feature } from "@/config/features"
import { requirePermission } from "@/lib/permissions"
import AdminNav from "@/components/AdminNav"
import { prismaAuth as dbAuth } from "@/lib/prisma"
import { buildEntry, append } from "@/lib/action-history"
import { LibraryForm } from "./form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Новый текст — библиотека",
  description: "Добавление нового текста в библиотеку межславянского языка.",
}

export default async function NewLibraryPage() {
  const session = await auth()
  if (!session) redirect("/login")
  await requirePermission(session, Feature.LibraryManage)

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
    const userId = s.user.id

    const actionHistory = append(null, buildEntry(userEmail, {
      title: { old: null, new: title },
      slug: { old: null, new: slug },
      author: { old: null, new: author },
      category: { old: null, new: category },
      flavor: { old: null, new: flavor },
      source: { old: null, new: source },
      yearWritten: { old: null, new: yearWritten },
      yearTranslated: { old: null, new: yearTranslated },
      translator: { old: null, new: translator },
      verified: { old: null, new: verified },
    }))

    await db.libraryEntry.create({
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
        addedById: userId,
        addedBy: userEmail,
        actionHistory,
      },
    })
    redirect("/admin/library")
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground transition-colors duration-300">
      <AdminNav userRole={session.user.role || ""} userPermissions={userPermissions} />
      <div className="flex-1 min-h-0 overflow-auto p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-bold mb-6">Новый текст</h1>
        <LibraryForm action={save} />
      </div>
    </div>
  )
}