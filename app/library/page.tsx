import { prismaLibrary as db } from "@/lib/prisma"
import { LibraryClient } from "./LibraryClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sbornik / Библиотека",
  description: "Коллекция избранных текстов на межславянском языке.",
}

const categoryMap: Record<string, { id: string; title: string; icon: string }> = {
  poem: { id: "poem", title: "Poemy / Поэмы", icon: "📜" },
  article: { id: "article", title: "Členky / Статьи", icon: "📰" },
  book: { id: "book", title: "Knigy / Книги", icon: "📖" },
  joke: { id: "joke", title: "Zasměšky / Анекдоты", icon: "😂" },
  story: { id: "story", title: "Povědky / Рассказы", icon: "✍️" },
  song: { id: "song", title: "Pěsnje / Песни", icon: "🎶" },
  prayer: { id: "prayer", title: "Molitvy / Молитвы", icon: "🙏" },
  quote: { id: "quote", title: "Citaty i prislovice / Цитаты", icon: "💬" },
  study: { id: "study", title: "Nauka medžuslovjanskogo / Изучение", icon: "🎓" },
}

export default async function LibraryPage() {
  const entries = await db.libraryEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      author: true,
      category: true,
      summary: true,
      views: true,
      createdAt: true,
    },
  })

  const items = entries.map(e => ({
    slug: e.slug,
    title: e.title,
    category: e.category,
    categoryMeta: categoryMap[e.category] || { id: e.category, title: e.category, icon: "📄" },
    author: e.author || "Neznany autor",
    summary: e.summary,
    views: e.views,
    date: e.createdAt.toISOString().slice(0, 10),
  }))

  const categories = [
    { id: "all", title: "Vse teksty / Все тексты", icon: "📚" },
    ...Object.values(categoryMap),
  ]

  return <LibraryClient categories={categories} items={items} />
}