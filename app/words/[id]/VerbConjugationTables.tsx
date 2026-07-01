import React, { useState } from 'react';
import { ConjugationResult, FullParadigm } from '@/lib/grammar/verb/types/conjugator';

interface TablesProps {
    data: ConjugationResult;
}

export const VerbConjugationTables: React.FC<TablesProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'indicative' | 'non-indicative'>('indicative');

    // Утилита для рендеринга стандартной сетки "Лицо x Число"
    const renderTimeGrid = (title: string, paradigm: FullParadigm) => (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-700 text-sm border-b pb-1.5 border-slate-100">{title}</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                    <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                        <th className="py-2 font-medium">Лицо</th>
                        <th className="py-2 font-medium">Единственное (Sg)</th>
                        <th className="py-2 font-medium">Двойственное (Du)</th>
                        <th className="py-2 font-medium">Множественное (Pl)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                    <tr>
                        <td className="py-2 text-slate-400 font-normal">1-е лицо</td>
                        <td className="py-2 text-blue-600 font-semibold">{paradigm['1sg']}</td>
                        <td className="py-2 text-indigo-600">{paradigm['1du']}</td>
                        <td className="py-2 text-slate-800">{paradigm['1pl']}</td>
                    </tr>
                    <tr>
                        <td className="py-2 text-slate-400 font-normal">2-е лицо</td>
                        <td className="py-2 text-blue-600 font-semibold">{paradigm['2sg']}</td>
                        <td className="py-2 text-indigo-600">{paradigm['2du']}</td>
                        <td className="py-2 text-slate-800">{paradigm['2pl']}</td>
                    </tr>
                    <tr>
                        <td className="py-2 text-slate-400 font-normal">3-е лицо</td>
                        <td className="py-2 text-blue-600 font-semibold">{paradigm['3sg']}</td>
                        <td className="py-2 text-indigo-600">{paradigm['3du']}</td>
                        <td className="py-2 text-slate-800">{paradigm['3pl']}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 p-2">
            {/* Мини-табы внутренней навигации */}
            <div className="flex gap-2 border-b border-slate-200/60 pb-2">
                <button
                    onClick={() => setActiveTab('indicative')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === 'indicative'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    Изъявительное (Indicativus)
                </button>
                <button
                    onClick={() => setActiveTab('non-indicative')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === 'non-indicative'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    Императив и Сослагательное
                </button>
            </div>

            {activeTab === 'indicative' ? (
                <div className="space-y-5"> {/* Вертикальный стек с равномерным отступом */}
                    {/* 1. Презенс / Будущее прямое */}
                    {renderTimeGrid(
                        data.aspect === 'perfective' ? 'Будущее простое (Futurum Rectum)' : 'Настоящее время (Praesens)',
                        data.indicative.presentOrFutureDirect
                    )}

                    {/* 2. Аналитическое будущее */}
                    {data.indicative.futureAnalytical && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                            <h4 className="font-bold text-slate-700 text-sm">Будущее аналитическое (Futurum Periphrasticum)</h4>
                            <div className="text-xs space-y-1 text-slate-600">
                                <div><span className="font-semibold text-blue-600">С быти:</span> {data.indicative.futureAnalytical.withByti['1sg']}, {data.indicative.futureAnalytical.withByti['2sg']}...</div>
                                <div><span className="font-semibold text-emerald-600">С имати:</span> {data.indicative.futureAnalytical.withImati['1sg']}, {data.indicative.futureAnalytical.withImati['2sg']}...</div>
                                <div><span className="font-semibold text-indigo-600">С хтѣти:</span> {data.indicative.futureAnalytical.withHtěti['1sg']}, {data.indicative.futureAnalytical.withHtěti['2sg']}...</div>
                            </div>
                        </div>
                    )}

                    {/* 3. Прошедшие времена — выводим строго друг за другом без grid-cols-2 */}
                    {renderTimeGrid('Аорист (Aoristus)', data.indicative.aorist)}

                    {renderTimeGrid('Имперфект (Imperfectus)', data.indicative.imperfect)}

                    {renderTimeGrid('Перфект (Perfectum, м.р.)', data.indicative.perfect.masculine)}

                    {renderTimeGrid('Плюсквамперфект (Plusquamperfectum, м.р.)', data.indicative.pluperfect.masculine)}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Повелительное наклонение */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="font-bold text-slate-700 text-sm">Повелительное наклонение (Imperativus)</h4>
                        <div className="grid grid-cols-3 gap-4 text-xs font-semibold py-2 border-t border-slate-50">
                            <div><span className="text-slate-400 font-normal">Sg (ты):</span> <span className="text-red-600">{data.imperative['2sg']}</span></div>
                            <div><span className="text-slate-400 font-normal">Du (вы два):</span> <span className="text-slate-800">{data.imperative['2du']}</span></div>
                            <div><span className="text-slate-400 font-normal">Pl (вы):</span> <span className="text-slate-800">{data.imperative['2pl']}</span></div>
                        </div>
                    </div>

                    {/* Сослагательное наклонение */}
                    {renderTimeGrid('Сослагательное наклонение (Conditionalis, м.р.)', data.conditional.masculine)}
                </div>
            )}
        </div>
    );
};
