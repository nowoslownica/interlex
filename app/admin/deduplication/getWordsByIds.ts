'use server';

import { prismaData as prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { checkPermission } from '@/lib/permissions';
import { Feature } from '@/config/features';

export async function getWordsByIds(ids: number[]) {
    const session = await auth();
    if (!await checkPermission(session, Feature.DeduplicationManage)) {
        return [];
    }

    if (ids.length === 0) return [];

    const results = await prisma.lexeme.findMany({
        where: { id: { in: ids } },
        include: {
            lexemeAllophones: { include: { flavor: true } },
            meanings: {
                include: { translations: true }
            }
        },
    });

    return results.map((word: any) => {
        const translations: Record<string, string[]> = {};
        const isv = word.lexemeAllophones.find((a: any) => a.flavor.code === 'CORE' && a.type === 'standard')?.value ?? '';
        const nsl = word.lexemeAllophones.find((a: any) => a.flavor.code === 'NSL' && a.type === 'standard')?.value ?? '';

        word.meanings.forEach((m: any) => {
            (m.translations || []).forEach((t: any) => {
                if (t.value) {
                    if (!translations[t.language]) translations[t.language] = [];
                    if (!translations[t.language].includes(t.value)) translations[t.language].push(t.value);
                }
            });
        });

        return {
            id: word.id,
            value: word.value || '',
            isv,
            nsl,
            stem: word.stem || '',
            pos: word.pos || '',
            gender: word.gender || '',
            declension: word.declension ?? null,
            conjugation: word.conjugation ?? null,
            transcription: word.transcription || '',
            mainCategory: word.mainCategory || '',
            etymology: word.etymology || '',
            usageType: word.usageType || '',
            addition: word.addition || '',
            external_id: word.external_id || '',
            translations,
        };
    });
}