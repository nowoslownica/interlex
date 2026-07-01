import React from 'react';

interface CaseForms {
    nom: string;
    gen: string;
    dat: string;
    acc: string;
    ins: string;
    loc: string;
    voc: string;
}

interface NounDeclensionTablesProps {
    data: {
        singular: CaseForms;
        dual?: CaseForms; // Двойственное число может отсутствовать у некоторых существительных pl. tantum
        plural: CaseForms;
    };
}

const CASES = [
    { key: 'nominative', label: 'Именительный', short: 'Им.' },
    { key: 'genitive', label: 'Родительный', short: 'Род.' },
    { key: 'dative', label: 'Дательный', short: 'Дат.' },
    { key: 'accusative', label: 'Винительный', short: 'Вин.' },
    { key: 'instrumental', label: 'Творительный', short: 'Твор.' },
    { key: 'locative', label: 'Местный', short: 'Мест.' },
    { key: 'vocative', label: 'Звательный', short: 'Зват.' },
] as const;

export const NounDeclensionTables: React.FC<NounDeclensionTablesProps> = ({ data }) => {
    const columns = [
        { title: 'Единственное (Sg)', forms: data.singular },
        { title: 'Двойственное (Du)', forms: data.dual },
        { title: 'Множественное (Pl)', forms: data.plural },
    ].filter(col => col.forms); // Убираем колонку, если данных по числу нет

    return (
        <div className="p-4 bg-slate-50 rounded-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col, cIdx) => (
                    <div
                        key={cIdx}
                        className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                                {col.title}
                            </h3>
                            <div className="space-y-3">
                                {CASES.map((c) => {
                                    const formValue = col.forms?.[c.key];
                                    if (!formValue) return null;

                                    return (
                                        <div key={c.key} className="flex justify-between items-baseline gap-2 text-sm">
                                            <span className="text-slate-400 font-medium shrink-0" title={c.label}>
                                                {c.short}
                                            </span>
                                            <span className="text-blue-700 font-semibold text-right break-all">
                                                {formValue}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
