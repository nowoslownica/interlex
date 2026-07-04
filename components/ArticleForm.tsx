"use client"

import { useState, useTransition, useEffect } from "react"

interface SelectedRootItem {
    id: number
    value: string
}

interface RootOption {
    id: number
    value: string | null
    roots_words?: { word?: { id: number; value: string } | null }[]
}

interface InflectionAnomalyItem {
    inflection: string
    grammeme: string
}

interface ArticleFormProps {
    title: string
    submitButtonText: string
    initialData?: {
        word: string
        base: string
        hasAnomalies: boolean
        inflectionAnomalies: InflectionAnomalyItem[]
        translationEn: string
        translationRu: string
        isRuVerified: boolean
        isEnVerified: boolean
        attachedRoots: SelectedRootItem[]
    }
    initialRoots: RootOption[]
    onSubmit: (data: any) => Promise<void>
}

export default function ArticleForm({
    title,
    submitButtonText,
    initialData,
    initialRoots,
    onSubmit,
}: ArticleFormProps) {
    const [isPending, startTransition] = useTransition()

    const [word, setWord] = useState(initialData?.word || "")
    const [base, setBase] = useState(initialData?.base || "")
    const [hasAnomalies, setHasAnomalies] = useState(initialData?.hasAnomalies || false)
    const [inflectionAnomalies, setInflectionAnomalies] = useState<InflectionAnomalyItem[]>(
        initialData?.inflectionAnomalies || []
    )
    const [translationEn, setTranslationEn] = useState(initialData?.translationEn || "")
    const [isEnVerified, setIsEnVerified] = useState(initialData?.isEnVerified || false)
    const [translationRu, setTranslationRu] = useState(initialData?.translationRu || "")
    const [isRuVerified, setIsRuVerified] = useState(initialData?.isRuVerified || false)

    const [searchQuery, setSearchQuery] = useState("")
    const [roots, setRoots] = useState<any[]>(initialRoots)
    const [isLoadingRoots, setIsLoadingRoots] = useState(false)

    const [selectedRoots, setSelectedRoots] = useState<SelectedRootItem[]>(
        initialData?.attachedRoots || []
    )
    const [newRoots, setNewRoots] = useState<string[]>([])

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setRoots(initialRoots)
                return
            }
            setIsLoadingRoots(true)
            try {
                const response = await fetch(`/api/roots?query=${encodeURIComponent(searchQuery)}`)
                if (response.ok) {
                    const data = await response.json()
                    setRoots(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoadingRoots(false)
            }
        }, 350)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, initialRoots])

    const handleToggleRoot = (root: RootOption) => {
        const isSelected = selectedRoots.some((r) => r.id === root.id)
        if (isSelected) {
            setSelectedRoots(selectedRoots.filter((r) => r.id !== root.id))
        } else {
            setSelectedRoots([...selectedRoots, { id: root.id, value: root.value || `ID: ${root.id}` }])
        }
    }

    const handleAddNewRoot = () => {
        const value = searchQuery.trim()
        if (!value) return
        if (!newRoots.includes(value)) {
            setNewRoots([...newRoots, value])
        }
        setSearchQuery("")
    }

    const addAnomaly = () => {
        setInflectionAnomalies([...inflectionAnomalies, { inflection: "", grammeme: "" }])
    }

    const removeAnomaly = (index: number) => {
        setInflectionAnomalies(inflectionAnomalies.filter((_, i) => i !== index))
    }

    const updateAnomaly = (index: number, field: keyof InflectionAnomalyItem, value: string) => {
        setInflectionAnomalies(inflectionAnomalies.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            await onSubmit({
                word,
                base,
                hasAnomalies,
                inflectionAnomalies: inflectionAnomalies.filter(a => a.inflection.trim() || a.grammeme.trim()),
                translationEn,
                translationRu,
                isEnVerified,
                isRuVerified,
                rootIds: selectedRoots.map((r) => r.id),
                newRootValues: newRoots,
            })
        })
    }

    return (
        <div className="max-w-5xl mx-auto bg-background p-6 rounded-lg border shadow-sm">
            <h1 className="text-2xl font-bold mb-6">{title}</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1">Слово</label>
                        <input
                            type="text"
                            required
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
                            placeholder="Введите слово..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Основа</label>
                        <input
                            type="text"
                            value={base}
                            onChange={(e) => setBase(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
                            placeholder="Основа для поиска словоформ (н-р: vod)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Основа слова для автоматической генерации парадигм и поиска омонимов
                        </p>
                    </div>

                    <div className="p-3 border rounded-md bg-muted/10 space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="hasAnomalies"
                                checked={hasAnomalies}
                                onChange={(e) => setHasAnomalies(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <label htmlFor="hasAnomalies" className="text-xs font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                                Флексии содержат аномалии
                            </label>
                        </div>

                        {hasAnomalies && (
                            <div className="pt-2 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground">Аномалии флексий</span>
                                    <button
                                        type="button"
                                        onClick={addAnomaly}
                                        className="text-xs px-2 py-1 border border-dashed rounded text-primary hover:bg-primary/5"
                                    >
                                        + Добавить
                                    </button>
                                </div>
                                {inflectionAnomalies.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item.inflection}
                                            onChange={(e) => updateAnomaly(index, "inflection", e.target.value)}
                                            className="flex-1 px-2 py-1 border rounded bg-background text-xs"
                                            placeholder="Флексия (н-р: -ami)"
                                        />
                                        <input
                                            type="text"
                                            value={item.grammeme}
                                            onChange={(e) => updateAnomaly(index, "grammeme", e.target.value)}
                                            className="flex-1 px-2 py-1 border rounded bg-background text-xs"
                                            placeholder="Граммема (н-р: PL_INST)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAnomaly(index)}
                                            className="text-xs text-destructive hover:text-destructive/80 px-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border rounded-md bg-muted/10 space-y-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Перевод на английский (En)
                            </label>
                            <input
                                type="text"
                                required
                                value={translationEn}
                                onChange={(e) => setTranslationEn(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                placeholder="English translation..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isEnVerified"
                                checked={isEnVerified}
                                onChange={(e) => setIsEnVerified(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <label htmlFor="isEnVerified" className="text-xs font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                                Английский перевод верифицирован
                            </label>
                        </div>
                    </div>

                    <div className="p-3 border rounded-md bg-muted/10 space-y-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Перевод на русский (Ru)
                            </label>
                            <input
                                type="text"
                                required
                                value={translationRu}
                                onChange={(e) => setTranslationRu(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                placeholder="Русский перевод..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isRuVerified"
                                checked={isRuVerified}
                                onChange={(e) => setIsRuVerified(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <label htmlFor="isRuVerified" className="text-xs font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                                Русский перевод верифицирован
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full min-h-[450px]">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium">Состав слова (Корни / Морфемы)</label>
                        {isLoadingRoots && <span className="text-xs text-muted-foreground animate-pulse">Поиск...</span>}
                    </div>

                    <div className="mb-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Поиск корней, приставок..."
                        />
                    </div>

                    {(selectedRoots.length > 0 || newRoots.length > 0) && (
                        <div className="mb-3 p-2 border border-dashed rounded-md bg-muted/10 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                            {selectedRoots.map((root) => (
                                <span key={`sel-${root.id}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                    {root.value}
                                    <button type="button" onClick={() => setSelectedRoots(selectedRoots.filter((r) => r.id !== root.id))} className="ml-1.5 text-primary hover:text-destructive font-bold">×</button>
                                </span>
                            ))}
                            {newRoots.map((val, idx) => (
                                <span key={`new-${idx}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                                    [Новый]: {val}
                                    <button type="button" onClick={() => setNewRoots(newRoots.filter((v) => v !== val))} className="ml-1.5 text-green-600 hover:text-destructive font-bold">×</button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 border rounded-md overflow-y-auto max-h-[260px] p-2 space-y-2 bg-muted/20">
                        {roots.length > 0 ? (
                            roots.map((root) => {
                                const isSelected = selectedRoots.some((r) => r.id === root.id)
                                const attachedWords = (root.roots_words || [])
                                    .map((rw) => rw.word)
                                    .filter((w): w is { id: number; value: string } => !!w && !!w.value)

                                return (
                                    <div key={root.id} className={`p-2 rounded-md border transition-colors ${isSelected ? "bg-primary/5 border-primary/40" : "bg-background border-border"}`}>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleRoot(root)}
                                            className="w-full text-left flex justify-between items-center font-medium text-sm"
                                        >
                                            <span>{root.value || `ID: ${root.id}`}</span>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="h-3.5 w-3.5 rounded border-muted text-primary"
                                            />
                                        </button>
                                        {attachedWords.length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {attachedWords.map((w) => (
                                                    <span key={w.id} className="px-1.5 py-0.5 rounded text-[10px] bg-muted border text-muted-foreground">{w.value}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            !isLoadingRoots && <p className="text-xs text-muted-foreground p-2 text-center">Ничего не найдено</p>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                        <button
                            type="button"
                            disabled={!searchQuery.trim()}
                            onClick={handleAddNewRoot}
                            className="w-full text-center py-2 border border-dashed rounded-md text-sm text-primary hover:bg-primary/5 disabled:opacity-40 transition-colors font-medium"
                        >
                            + Добавить &quot;{searchQuery || "..."}&quot; как новый компонент
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4 border-t">
                    <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                        {isPending ? "Сохранение..." : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    )
}