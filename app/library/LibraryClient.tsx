"use client"

import { useState } from "react"
import Link from "next/link"

interface Category {
  id: string
  title: string
  icon: string
}

interface LibraryItem {
  slug: string
  title: string
  category: string
  categoryMeta: { id: string; title: string; icon: string }
  author: string
  summary: string | null
  views: number
  date: string
}

interface LibraryClientProps {
  categories: Category[]
  items: LibraryItem[]
}

export function LibraryClient({ categories, items }: LibraryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden text-sm">
      <aside className="w-80 border-r bg-muted/20 flex flex-col h-full shrink-0 hidden lg:flex">
        <div className="p-6 border-b space-y-3 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Glavna stranica / На главную
          </Link>
          <div className="space-y-1">
            <h2 className="font-black text-xl tracking-tight text-foreground">Sbornik</h2>
            <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
              Biblioteka tekstov
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          <h4 className="text-xxs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
            Kategorije / Категории
          </h4>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all text-xs font-medium flex items-center gap-3 ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-base leading-none">{category.icon}</span>
              <span className="truncate">{category.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t bg-muted/10 shrink-0 text-xxs text-muted-foreground space-y-3">
          <a
            href="https://isv.miraheze.org/wiki/Sbornik:Glavna_stranica"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold transition-all border border-blue-500/20 group text-center"
          >
            <span>Vikisbornik (Miraheze) ↗</span>
          </a>
          <div className="space-y-1 px-1 pt-1">
            <p>Лицензия: CC BY-SA 4.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="border-b px-6 py-5 bg-background/50 backdrop-blur shrink-0 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Iskati tekst ili autora... / Искать текст или автора..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-input rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/textbook"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent transition-colors text-center"
            >
              Učebnik / Учебник 📖
            </Link>
            <Link
              href="/admin/library/new"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 transition-all text-center"
            >
              + Dodati tekst
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 2xl:px-16 py-8 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="p-6 md:p-8 border border-dashed rounded-3xl bg-muted/10 space-y-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                Vitajte! / Добро пожаловать!
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Tu jest sbornik råzličnyh tekstov vò języku medžuslovjanskom, da byste legko je nahodili vò jednom městě. Здесь собраны поэмы, статьи, книги и учебные материалы на межславянском языке.
              </p>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-foreground">
                {categories.find(c => c.id === selectedCategory)?.title.split(" / ")[0]}
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                Найдено: {filteredItems.length}
              </span>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
                {filteredItems.map(item => (
                  <Link
                    key={item.slug}
                    href={`/library/${item.slug}`}
                    className="p-5 border rounded-2xl bg-background shadow-sm hover:shadow-md hover:border-muted-foreground/20 flex flex-col justify-between h-48 transition-all group cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xxs font-bold uppercase tracking-wider">
                          {item.categoryMeta.icon} {item.category}
                        </span>
                        <span className="text-xxs text-muted-foreground font-mono">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-foreground tracking-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      {item.summary && (
                        <p className="text-xxs text-muted-foreground line-clamp-2">{item.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t text-xxs text-muted-foreground shrink-0">
                      <span className="truncate max-w-[120px]">✍️ {item.author}</span>
                      <span>👁️ {item.views}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 border border-dashed rounded-3xl bg-muted/5">
                <div className="text-3xl">📭</div>
                <div className="space-y-1">
                  <h4 className="font-bold">Teksty ne nahodili se</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Попробуйте изменить параметры фильтрации или проверить правильность написания поискового запроса.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}