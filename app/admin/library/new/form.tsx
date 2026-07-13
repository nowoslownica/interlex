"use client"

import { useState, useCallback } from "react"
import { useFormStatus } from "react-dom"
import { FLAVOR_CODES, FLAVOR_METADATA } from "@/config/flavor"

const CATEGORIES = [
  { value: "poem", label: "Poema / Поэма" },
  { value: "article", label: "Členok / Статья" },
  { value: "book", label: "Kniga / Книга" },
  { value: "joke", label: "Zasměška / Анекдот" },
  { value: "story", label: "Povědka / Рассказ" },
  { value: "song", label: "Pěsńa / Песня" },
  { value: "prayer", label: "Molitva / Молитва" },
  { value: "quote", label: "Citata / Цитата" },
  { value: "study", label: "Nauka / Изучение" },
] as const

const FLAVORS = FLAVOR_CODES.map(code => ({
  value: code,
  label: FLAVOR_METADATA[code].label,
}))

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\u00e0-\u00fc\u0100-\u024f-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

interface LibraryFormProps {
  action: (formData: FormData) => Promise<void>
  initial?: {
    slug: string
    title: string
    author: string
    category: string
    flavor: string
    body: string
    summary: string
    corpusSlug: string
    verified: boolean
    source: string
    yearWritten: number | null
    yearTranslated: number | null
    translator: string
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {pending ? "Сохранение..." : "Сохранить"}
    </button>
  )
}

export function LibraryForm({ action, initial }: LibraryFormProps) {
  const [title, setTitle] = useState(initial?.title || "")
  const [slug, setSlug] = useState(initial?.slug || "")

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    if (!initial?.slug) {
      setSlug(generateSlug(value))
    }
  }, [initial?.slug])

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value)
  }, [])

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Slug *</label>
          <input
            name="slug"
            value={slug}
            onChange={handleSlugChange}
            required
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="my-text-slug"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Название *</label>
          <input
            name="title"
            value={title}
            onChange={handleTitleChange}
            required
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="Название текста"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Автор</label>
          <input
            name="author"
            defaultValue={initial?.author}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="Имя автора"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Категория *</label>
          <select
            name="category"
            defaultValue={initial?.category}
            required
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Выберите категорию</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Флаворизация</label>
          <select
            name="flavor"
            defaultValue={initial?.flavor || "CORE"}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
          >
            {FLAVORS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Ссылка на источник</label>
          <input
            name="source"
            defaultValue={initial?.source}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="https://example.com/original-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Год написания</label>
          <input
            name="yearWritten"
            type="number"
            defaultValue={initial?.yearWritten ?? ""}
            min={-3000}
            max={2100}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="2024"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Год перевода</label>
          <input
            name="yearTranslated"
            type="number"
            defaultValue={initial?.yearTranslated ?? ""}
            min={-3000}
            max={2100}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            placeholder="2024"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Автор перевода</label>
        <input
          name="translator"
          defaultValue={initial?.translator}
          className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
          placeholder="Имя переводчика"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Краткое описание</label>
        <input
          name="summary"
          defaultValue={initial?.summary}
          className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
          placeholder="Краткое описание текста"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Corpus slug</label>
        <input
          name="corpusSlug"
          defaultValue={initial?.corpusSlug}
          className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
          placeholder="Ссылка на документ в корпусе"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Текст (Markdown) *</label>
        <textarea
          name="body"
          defaultValue={initial?.body}
          required
          rows={20}
          className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none font-mono resize-y"
          placeholder="Введите текст в формате Markdown..."
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="verified"
          defaultChecked={initial?.verified}
          className="rounded border text-primary focus:ring-primary"
        />
        <span className="text-muted-foreground">Орфография проверена</span>
      </label>

      <div className="flex gap-2">
        <SubmitButton />
        <a
          href="/admin/library"
          className="px-4 py-2 text-sm font-medium rounded border hover:bg-muted transition-colors"
        >
          Отмена
        </a>
      </div>
    </form>
  )
}