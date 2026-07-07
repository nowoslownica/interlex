import {prismaData as db } from "@/lib/prisma";
import {Lexeme} from "@/prisma/generated/data/client";

export async function getRandomWordWithTranslations(): Promise<Lexeme | null> {
    const aggregations = await db.lexeme.aggregate({
        _max: { id: true },
    });

    const maxId = aggregations._max.id;
    if (!maxId) return null;

    // 2. Генерируем случайный ID
    const randomId = Math.floor(Math.random() * maxId) + 1;

    // 3. Выборка слова с глубоким включением (Include) связанных таблиц
    const randomWord = await db.lexeme.findFirst({
        where: {
            id: { gte: randomId },
        },
        select: {
            id: true,
            value: true,
            isv: true,
            pos: true,
            meanings: {
                select: {
                    id: true,
                    ru_mean: {
                        select: {
                            id: true,
                            value: true,
                        },
                    },
                    en_mean: {
                        select: {
                            id: true,
                            value: true,
                        },
                    },
                },
            },
        },
    });

    if (!randomWord) {
        return await db.lexeme.findFirst({
            select: {
                id: true,
                value: true,
                isv: true,
                pos: true,
                meanings: {
                    select: {
                        id: true,
                        ru_mean: {
                            select: {
                                id: true,
                                value: true,
                            },
                        },
                        en_mean: {
                            select: {
                                id: true,
                                value: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return randomWord;
}
