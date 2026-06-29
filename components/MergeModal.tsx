// app/admin/deduplication/_components/MergeModal.tsx
'use client'

import { useState } from 'react'

interface MergeModalProps {
    isOpen: boolean
    onClose: () => void
    selectedWords: Word[]
}

export default function MergeModal({ isOpen, onClose, selectedWords }: MergeModalProps) {
    const [mainWordId, setMainWordId] = useState<number | null>(null)
    const [targetLangs, setTargetLangs] = useState<Record<number, string>>({})

    if (!isOpen || !mainWordId) return null // В реальном проекте добавьте лоадер для загрузки данных

    const mainWord = selectedWords.find((w) => w.id === mainWordId)

    const handleLanguageSelect = (wordId: number, lang: string, value: string) => {
        setTargetLangs((prev) => ({
            ...prev,
            [wordId]: {
                ...prev[wordId],
                [lang]: value,
            },
        }))
    }

    const handleMerge = async () => {
        try {
            const res = await fetch('/api/admin/deduplication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainWordId,
                    mergeWordIds: selectedWords.filter((w) => w.id !== mainWordId).map((w) => w.id),
                    translationsOverride: targetLangs,
                }),
            })

            if (res.ok) {
                alert('Слова объединены успешно!')
                onClose()
                window.location.reload()
            } else {
                alert('Ошибка при объединении: ' + (await res.text()))
            }
        } catch (err) {
            console.error(err)
            alert('Ошибка сети')
        }
    }

    if (!isOpen || selectedWords.length < 2) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Слияние {selectedWords.length} дубликатов</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Выберите основное слово, и укажите, какие переводы оставить.
                </p>

                {/* Выбор основного слова */}
                <div className="mt-4 space-y-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Основное слово:</span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {selectedWords.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setMainWordId(w.id)}
                                className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                                    mainWordId === w.id
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div>
                                    <div className="font-medium">{w.word}</div>
                                    <div className="text-xs text-gray-500">ID {w.id} • {w.source}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Список переводов для редактирования */}
                <div className="mt-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Переводы (над основным словом)
          </span>
                    {selectedWords.flatMap((w) => w.translations || []).map((t) => (
                        <div key={t.id} className="mt-2 grid grid-cols-[120px_1fr_auto] gap-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase">{t.language}</span>
                            <input
                                type="text"
                                defaultValue={t.text}
                                className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                onChange={(e) => handleLanguageSelect(t.wordId, t.language, e.target.value)}
                            />
                            <span className="text-xs text-gray-400 self-center">← {t.wordId === mainWordId ? 'основное' : `ID ${t.wordId}`}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleMerge}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Объединить
                    </button>
                </div>
            </div>
        </div>
    )
}