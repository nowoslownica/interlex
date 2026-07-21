"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import type { TokenResult } from "./CorpusTokenDisplay"

interface LexemeInfo {
  slug: string
  value: string | null
  pos: string | null
  gender: string | null
  aspect: string | null
  transitivity: string | null
  animacy: string | null
  degree: string | null
  pronType: string | null
  numType: string | null
  paradigm: string | null
  protoStemClass: string | null
  stemExtension: string | null
  stem: string | null
  secondaryStem: string | null
  frequency: string | null
  intelligibility: string | null
  etymology: string | null
  proto: string | null
  corpusFrequency: number | null
  corpusFrequencyPerMln: number | null
  corpusRank: number | null
  corpusHapax: boolean | null
}

const FEAT_LABELS: Record<string, string> = {
  nom: "Именительный", gen: "Родительный", dat: "Дательный", acc: "Винительный",
  ins: "Творительный", loc: "Местный", voc: "Звательный",
  sg: "Единственное", du: "Двойственное", pl: "Множественное",
  masc: "Мужской", fem: "Женский", neut: "Средний",
  anim: "Одушевлённый", inanim: "Неодушевлённый",
  pres: "Настоящее", past: "Прошедшее", fut: "Будущее", aor: "Аорист", impf: "Имперфект",
  ind: "Изъявительное", imp: "Повелительное", sub: "Сослагательное",
  act: "Действительный", pass: "Страдательный",
  inf: "Инфинитив", fin: "Личная", part: "Причастие", ger: "Деепричастие",
  pos: "Положительная", comp: "Сравнительная", sup: "Превосходная",
  first: "1-е", second: "2-е", third: "3-е",
}

const FEAT_ORDER = [
  { key: "case", label: "Падеж" },
  { key: "number", label: "Число" },
  { key: "gender", label: "Род" },
  { key: "person", label: "Лицо" },
  { key: "tense", label: "Время" },
  { key: "mood", label: "Наклонение" },
  { key: "voice", label: "Залог" },
  { key: "verbForm", label: "Форма" },
  { key: "degree", label: "Степень" },
  { key: "animacy", label: "Одушевлённость" },
  { key: "aspect", label: "Вид" },
]

export default function TokenSidebar({
  token,
  onClose,
}: {
  token: TokenResult | null
  onClose: () => void
}) {
  const [lexeme, setLexeme] = useState<LexemeInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLexeme = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/lexicon/by-slug/${slug}`)
      if (res.status === 404) throw new Error("Not found")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setLexeme(data)
    } catch (e) {
      const msg = e instanceof Error && e.message === "Not found"
        ? "Лексема не найдена в словаре"
        : "Не удалось загрузить данные о лексеме"
      setError(msg)
      setLexeme(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token?.wordSlug) {
      fetchLexeme(token.wordSlug)
    } else {
      setLexeme(null)
      setError(null)
      setLoading(false)
    }
  }, [token, fetchLexeme])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!token) return null

  const hasHomonymy = token.matchCount > 1

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-[380px] bg-background border-r border-border shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Информация о токене</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
              Поверхностная форма
            </div>
            <div className="px-3 py-2.5 font-mono text-base">{token.surfaceForm}</div>
          </div>

          {token.isPunctuation ? (
            <div className="rounded-lg border border-border p-3 text-muted-foreground text-xs">
              Знак пунктуации
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
                  Лемма / Словарная форма
                </div>
                <div className="px-3 py-2.5">
                  {token.wordSlug ? (
                    <Link
                      href={`/words/${token.wordSlug}`}
                      className="text-primary hover:underline font-mono"
                      target="_blank"
                    >
                      {token.lemma}
                    </Link>
                  ) : (
                    <span className="font-mono">{token.lemma}</span>
                  )}
                  {!token.isRecognized && (
                    <span className="ml-2 text-xs text-red-500">не найдено</span>
                  )}
                  {token.isPartialMatch && (
                    <span className="ml-2 text-xs text-yellow-500">основа найдена</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
                  Часть речи
                </div>
                <div className="px-3 py-2.5 font-mono">{token.pos}</div>
              </div>

              {token.isRecognized && Object.keys(token.feats).length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
                    Граммема
                  </div>
                  <div className="divide-y divide-border">
                    {FEAT_ORDER.map(({ key, label }) => {
                      const val = token.feats![key]
                      if (!val) return null
                      const displayVal = FEAT_LABELS[val] ?? val
                      const displayKey =
                        key === "person" ? "Лицо" :
                        key === "verbForm" ? "Глагольная форма" :
                        key === "aspect" ? "Вид" : label
                      return (
                        <div key={key} className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">{displayKey}</span>
                          <span className="font-mono text-xs ml-2">{displayVal}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {hasHomonymy && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Неразрешённая омонимия
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Найдено {token.matchCount} возможных лексем. Первая выбрана автоматически.
                  </p>
                </div>
              )}

              {token.isRecognized && lexeme && (
                <>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
                      Лексема
                    </div>
                    <div className="divide-y divide-border">
                      {lexeme.value && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Словарная форма</span>
                          <span className="font-mono text-xs">{lexeme.value}</span>
                        </div>
                      )}
                      {lexeme.gender && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Род</span>
                          <span className="font-mono text-xs">
                            {lexeme.gender === "masc" ? "Мужской" : lexeme.gender === "fem" ? "Женский" : lexeme.gender === "neut" ? "Средний" : lexeme.gender}
                          </span>
                        </div>
                      )}
                      {lexeme.aspect && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Вид</span>
                          <span className="font-mono text-xs">
                            {lexeme.aspect === "perf" ? "Совершенный" : lexeme.aspect === "impf" ? "Несовершенный" : lexeme.aspect}
                          </span>
                        </div>
                      )}
                      {lexeme.paradigm && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Парадигма</span>
                          <span className="font-mono text-xs">{lexeme.paradigm}</span>
                        </div>
                      )}
                      {lexeme.protoStemClass && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Класс основы</span>
                          <span className="font-mono text-xs">{lexeme.protoStemClass}</span>
                        </div>
                      )}
                      {lexeme.stem && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Основа</span>
                          <span className="font-mono text-xs">{lexeme.stem}</span>
                        </div>
                      )}
                      {lexeme.frequency && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Частотность</span>
                          <span className="font-mono text-xs">{lexeme.frequency}</span>
                        </div>
                      )}
                      {lexeme.intelligibility && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Понятность</span>
                          <span className="font-mono text-xs">{lexeme.intelligibility}</span>
                        </div>
                      )}
                      {lexeme.etymology && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Этимология</span>
                          <span className="font-mono text-xs text-right max-w-[200px] truncate" title={lexeme.etymology}>{lexeme.etymology}</span>
                        </div>
                      )}
                      {lexeme.proto && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Праславянская</span>
                          <span className="font-mono text-xs">{lexeme.proto}</span>
                        </div>
                      )}
                      {lexeme.corpusFrequency != null && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Част. в корпусе</span>
                          <span className="font-mono text-xs">
                            {lexeme.corpusFrequency}
                            {lexeme.corpusFrequencyPerMln != null && ` (${lexeme.corpusFrequencyPerMln}/млн)`}
                          </span>
                        </div>
                      )}
                      {lexeme.corpusRank != null && (
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">Ранг</span>
                          <span className="font-mono text-xs">#{lexeme.corpusRank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {lexeme.slug && (
                    <Link
                      href={`/words/${lexeme.slug}`}
                      target="_blank"
                      className="block w-full text-center px-3 py-2 rounded-lg border border-border text-xs text-primary hover:bg-muted/30 transition-colors"
                    >
                      Открыть страницу слова →
                    </Link>
                  )}
                </>
              )}

              {token.isRecognized && loading && (
                <div className="text-xs text-muted-foreground animate-pulse text-center py-4">
                  Загрузка данных...
                </div>
              )}

              {error && (
                <div className="text-xs text-red-500 text-center py-2">{error}</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}