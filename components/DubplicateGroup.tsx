// app/admin/deduplication/_components/DuplicateGroup.tsx
'use client'

import { useState } from 'react'
import MergeModal from "@/components/MergeModal";

interface DuplicateGroupProps {
    word: string
    words: any[]
    onSelect: (wordId: number) => void
    selectedIds: number[]
}

export default function DuplicateGroup({
                                           word,
                                           words,
                                           onSelect,
                                           selectedIds,
                                       }: DuplicateGroupProps) {
    const [showModal, setShowModal] = useState(false)

    if (words.length <= 1) return null

    return (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Группа: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">"{word}"</code>
                    <span className="ml-2 text-sm text-gray-500">({words.length} дубликатов)</span>
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={selectedIds.length < 2}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                        selectedIds.length >= 2
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                    }`}
                >
                    Объединить выбранные
                </button>
            </div>

            <div className="mt-3 space-y-2">
                {words.map((w) => (
                    <label key={w.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(w.id)}
                            onChange={() => onSelect(w.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                ID {w.id} • Источник: <span className="font-mono text-xs text-gray-500">{w.source || 'не указан'}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Переводы: {w.translations?.length || 0} языков
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            {showModal && (
                <MergeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    selectedWords={words.filter((w) => selectedIds.includes(w.id))}
                />
            )}
        </div>
    )
}