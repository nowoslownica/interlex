'use client';
import React, { useState } from 'react';
import { generatePronounForm, EnhancedPronounDbItem } from '@/lib/grammar/pronoun/index';
import { Case, NumberType } from '@/lib/grammar/noun/index';
import { GrammaticalGender } from '@/lib/grammar/common/gender';
import { AccentParadigm } from '@/lib/grammar/common/paradigm';

interface PronounDeclensionTablesProps {
    isv: string;
    paradigm: string;
}

const CASES = [
    { key: Case.NOMINATIVE, label: 'Именительный', short: 'Им.' },
    { key: Case.GENITIVE, label: 'Родительный', short: 'Род.' },
    { key: Case.DATIVE, label: 'Дательный', short: 'Дат.' },
    { key: Case.ACCUSATIVE, label: 'Винительный', short: 'Вин.' },
    { key: Case.INSTRUMENTAL, label: 'Творительный', short: 'Твор.' },
    { key: Case.LOCATIVE, label: 'Местный', short: 'Мест.' },
    { key: Case.VOCATIVE, label: 'Звательный', short: 'Зват.' },
] as const;

const NUMBERS = [
    { key: NumberType.SINGULAR, title: 'Sg' },
    { key: NumberType.DUAL, title: 'Du' },
    { key: NumberType.PLURAL, title: 'Pl' },
] as const;

export const PronounDeclensionTables: React.FC<PronounDeclensionTablesProps> = ({ isv, paradigm }) => {
    const lemma = isv.toLowerCase().trim();
    const isPersonal = ['ja', 'ty'].includes(lemma);
    const isAnaphoric = lemma === 'on';

    const dbItem: EnhancedPronounDbItem = {
        interslavic: isv,
        protoSlavic: isv,
        paradigm: paradigm as AccentParadigm,
        pronClass: isPersonal ? 'personal' : 'demonstrative_who_what',
    };

    if (isPersonal) {
        return (
            <div className="p-4 bg-slate-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {NUMBERS.map((n) => (
                        <div key={n.key} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                                {n.title}
                            </h3>
                            <div className="space-y-3">
                                {CASES.map((c) => {
                                    const fullForm = generatePronounForm({ dbItem, targetCase: c.key, targetNumber: n.key, isEnclitic: false });
                                    const shortForm = generatePronounForm({ dbItem, targetCase: c.key, targetNumber: n.key, isEnclitic: true });
                                    return (
                                        <div key={c.key} className="flex justify-between items-baseline gap-2 text-sm">
                                            <span className="text-slate-400 font-medium shrink-0">{c.short}</span>
                                            <span className="text-blue-700 font-semibold text-right break-all">
                                                {fullForm}
                                                {shortForm !== fullForm && (
                                                    <span className="text-slate-400 font-normal text-xs ml-1">({shortForm})</span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isAnaphoric) {
        const GENDERS = [
            { key: GrammaticalGender.MASC, label: 'Мужской (Masc)' },
            { key: GrammaticalGender.FEM, label: 'Женский (Fem)' },
            { key: GrammaticalGender.NEUT, label: 'Средний (Neut)' },
        ] as const;
        return (
            <div className="p-4 bg-slate-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {GENDERS.map((g) => {
                        const forms = CASES.reduce((acc, c) => ({
                            ...acc,
                            [c.key]: generatePronounForm({
                                dbItem, targetCase: c.key, targetNumber: NumberType.SINGULAR, targetGender: g.key,
                            }),
                        }), {} as Record<string, string>);
                        return (
                            <div key={g.key} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                                    {g.label}
                                </h3>
                                <div className="space-y-3">
                                    {CASES.map((c) => (
                                        <div key={c.key} className="flex justify-between items-baseline gap-2 text-sm">
                                            <span className="text-slate-400 font-medium shrink-0">{c.short}</span>
                                            <span className="text-blue-700 font-semibold text-right break-all">{forms[c.key]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-50 rounded-xl">
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="space-y-3">
                    {CASES.map((c) => {
                        const form = generatePronounForm({
                            dbItem, targetCase: c.key, targetNumber: NumberType.SINGULAR, targetGender: GrammaticalGender.MASC,
                        });
                        return (
                            <div key={c.key} className="flex justify-between items-baseline gap-2 text-sm">
                                <span className="text-slate-400 font-medium shrink-0">{c.short}</span>
                                <span className="text-blue-700 font-semibold text-right break-all">{form}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};