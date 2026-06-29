'use server';

import { prismaData as prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Список поддерживаемых языковых таблиц для автоматизации переноса
const LANGUAGE_KEYS = ['en', 'ru', 'mk', 'sr', 'uk', 'bg', 'pl', 'be', 'cs', 'sk', 'sl', 'hr', 'cu', 'de', 'nl', 'eo'] as const;

/**
 * Реальный поиск слов по вашей схеме
 */
export async function searchDuplicateWords(query: string) {
    if (!query || query.trim().length < 2) return [];

    try {
        // Подтягиваем слова и их смыслы со всеми языковыми переводами
        const results = await prisma.word.findMany({
            where: {
                OR: [
                    { value: { contains: query } },
                    { isv: { contains: query } },
                ],
            },
            include: {
                meanings: {
                    include: {
                        ru_word: true, en_word: true, pl_word: true, uk_word: true,
                        be_word: true, cs_word: true, sk_word: true, bg_word: true,
                        mk_word: true, sr_word: true, sl_word: true, hr_word: true,
                        cu_word: true, de_word: true, nl_word: true, eo_word: true
                    }
                }
            },
            take: 30,
        });

        // Трансформируем реляционную структуру в плоский вид для удобства фронтенда
        return results.map((word) => {
            const translations: Record<string, string[]> = {};

            word.meanings.forEach((m: any) => {
                LANGUAGE_KEYS.forEach((lang) => {
                    const relationField = `${lang}_word`;
                    if (m[relationField] && Array.isArray(m[relationField])) {
                        m[relationField].forEach((t: any) => {
                            if (t.value) {
                                if (!translations[lang]) translations[lang] = [];
                                if (!translations[lang].includes(t.value)) translations[lang].push(t.value);
                            }
                        });
                    }
                });
            });

            return {
                id: word.id,
                value: word.value || '',
                isv: word.isv || '',
                nsl: word.nsl || '',
                type: word.type || '',
                addition: word.addition || 'Источник не указан', // Поле источника
                translations, // Объект вида { ru: ["город"], pl: ["gród"] }
            };
        });
    } catch (error) {
        console.error('Ошибка при поиске в БД:', error);
        return [];
    }
}

/**
 * Продакшен-функция атомарного мержа по вашей реляционной схеме
 */
export async function mergeWordsAction(
    targetId: Int,
    sourceId: Int,
    updatedFields: { value: string; isv: string; nsl: string; type: string; addition: string }
) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Обновляем метаданные главного слова
            await tx.word.update({
                where: { id: targetId },
                data: {
                    value: updatedFields.value,
                    isv: updatedFields.isv,
                    nsl: updatedFields.nsl,
                    type: updatedFields.type,
                    addition: updatedFields.addition,
                },
            });

            // 2. Перепривязываем все Meaning (смыслы) от удаляемого слова к главному
            await tx.meaning.updateMany({
                where: { wordId: sourceId },
                data: { wordId: targetId },
            });

            // 3. Перепривязываем связи с корнями (RootWord)
            await tx.rootWord.updateMany({
                where: { wordId: sourceId },
                data: { wordId: targetId },
            });

            // 4. Перепривязываем синонимы (обе стороны отношений в вашей схеме)
            await tx.synonym.updateMany({
                where: { rootId: sourceId },
                data: { rootId: targetId },
            });
            await tx.synonym.updateMany({
                where: { wordId: sourceId },
                data: { wordId: targetId },
            });

            // 5. Перепривязываем антонимы (обе стороны отношений)
            await tx.antonym.updateMany({
                where: { rootId: sourceId },
                data: { rootId: targetId },
            });
            await tx.antonym.updateMany({
                where: { wordId: sourceId },
                data: { wordId: targetId },
            });

            // 6. Теперь, когда у sourceId не осталось дочерних зависимостей, удаляем его
            await tx.word.delete({
                where: { id: sourceId },
            });
        });

        revalidatePath('/admin/deduplication');
        return { success: true };
    } catch (error: any) {
        console.error('Ошибка транзакции слияния:', error);
        return { success: false, error: error.message || 'Ошибка выполнения транзакции базы данных.' };
    }
}
