import { prismaData as db } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { type Prisma } from "@/prisma/generated/data/client"
import ArticleForm from "@/components/ArticleForm"
import type { Metadata } from "next";
import { auth } from "@/auth"
import { buildEntry, append } from "@/lib/action-history"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const word = await db.lexeme.findUnique({ where: { id: parseInt(id, 10) }, select: { value: true } });
  return {
    title: `Редактирование: ${word?.value ?? id}`,
    description: `Редактирование словарной статьи «${word?.value ?? id}» в базе межславянского лексикона.`,
  };
}

const rootSelectStructure = {
    id: true,
    value: true,
    lexemes_morphemes: {
        take: 10,
        select: {
            id: true,
            lexeme: {
                select: {
                    id: true,
                    value: true,
                },
            },
        },
    },
}

export type MorphemeWithLexemes = Prisma.MorphemeGetPayload<{
    select: typeof rootSelectStructure
}>

interface EditPageProps {
    params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditPageProps) {
    const { id } = await params
    const wordId = parseInt(id, 10)

    if (isNaN(wordId)) notFound()

    // 2. Параллельно загружаем редактируемое слово и первые 30 корней для формы
    const [wordData, initialRoots] = await Promise.all([
        db.lexeme.findUnique({
            where: { id: wordId },
            include: {
                meanings: {
                    include: {
                        en_word: true,
                        ru_word: true,
                    },
                },
                lexemes_morphemes: {
                    take: 1,
                    select: {
                        morphemeId: true,
                        morpheme: {
                            select: {
                                value: true,
                            },
                        },
                    },
                },
                anomalies: true,
            },
        }),
        db.morpheme.findMany({
            select: rootSelectStructure,
            orderBy: { value: "asc" },
            take: 30,
        }) as Promise<MorphemeWithLexemes[]>,
    ])

    if (!wordData) notFound()

    // Извлекаем текущие переводы (En и Ru) из структуры связей вашей БД
    const firstMeaning = wordData.meanings?.[0]
    const currentTranslationEn = firstMeaning?.en_word?.[0]?.value || ""
    const isEnVerified = firstMeaning?.en_word?.[0]?.veryfied === 1

    const currentTranslationRu = firstMeaning?.ru_word?.[0]?.value || ""
    const isRuVerified = firstMeaning?.ru_word?.[0]?.veryfied === 1

    const currentAnomalies = (wordData.anomalies || []).map(a => ({
        inflection: a.inflection,
        grammeme: a.grammeme,
    }))

    // 3. Функция обновления статьи (Server Action)
    async function updateArticle(formData: any) {
        "use server"
        const session = await auth()
        const author = session?.user?.email || "unknown"

        const stemValue = formData.stem?.trim() || null

        // Получаем текущее слово, чтобы сравнить старую и новую основу
        const currentWord = await db.lexeme.findUnique({ where: { id: wordId } })
        const currentWordWithHistory = currentWord as { actionHistory?: string | null } & typeof currentWord

        // Собираем изменения для аудита
        const wordChanges: Record<string, { old: unknown; new: unknown }> = {}
        if (currentWord?.value !== formData.word) {
            wordChanges.value = { old: currentWord?.value ?? null, new: formData.word }
        }
        if ((currentWord?.stem ?? null) !== stemValue) {
            wordChanges.stem = { old: currentWord?.stem ?? null, new: stemValue }
        }
        if (currentWord?.hasAnomalies !== (formData.hasAnomalies === true)) {
            wordChanges.hasAnomalies = { old: currentWord?.hasAnomalies, new: formData.hasAnomalies === true }
        }

        // Обновляем базовое слово
        await db.lexeme.update({
            where: { id: wordId },
            data: {
                value: formData.word,
                stem: stemValue,
                hasAnomalies: formData.hasAnomalies === true,
                ...(Object.keys(wordChanges).length > 0 ? {
                    actionHistory: append(currentWordWithHistory?.actionHistory, buildEntry(author, wordChanges)),
                } : {}),
            },
        })

        // Синхронизируем base_homonyms
        const oldStem = currentWord?.stem?.trim() || null

        // Если старая основа была и отличается от новой — удаляем wordId из старой
        if (oldStem && oldStem !== stemValue) {
            const oldEntry = await db.baseHomonym.findUnique({
                where: { base: oldStem },
            })
            if (oldEntry) {
                const ids: number[] = JSON.parse(oldEntry.wordIds).filter((id: number) => id !== wordId)
                if (ids.length > 0) {
                    await db.baseHomonym.update({
                        where: { base: oldStem },
                        data: { wordIds: JSON.stringify(ids) },
                    })
                } else {
                    await db.baseHomonym.delete({ where: { base: oldStem } })
                }
            }
        }

        // Если новая основа указана — добавляем/обновляем в base_homonyms
        if (stemValue) {
            const existing = await db.baseHomonym.findUnique({
                where: { base: stemValue },
            })
            if (existing) {
                const ids: number[] = JSON.parse(existing.wordIds)
                if (!ids.includes(wordId)) {
                    ids.push(wordId)
                    await db.baseHomonym.update({
                        where: { base: stemValue },
                        data: { wordIds: JSON.stringify(ids) },
                    })
                }
            } else {
                await db.baseHomonym.create({
                    data: {
                        base: stemValue,
                        wordIds: JSON.stringify([wordId]),
                    },
                })
            }
        }

        // Синхронизируем аномалии флексий: удаляем старые, создаём новые
        await db.inflectionAnomaly.deleteMany({
            where: { lexemeId: wordId },
        })
        const anomalies = formData.inflectionAnomalies || []
        if (anomalies.length > 0) {
            await db.inflectionAnomaly.createMany({
                data: anomalies.map((a: { inflection: string; grammeme: string }) => ({
                    lexemeId: wordId,
                    inflection: a.inflection,
                    grammeme: a.grammeme,
                })),
            })
        }

        // Логика обновления/создания корня
        // let targetRootId = formData.rootId
        //
        // if (formData.newRootValue) {
        //     // Если администратор ввел новый корень в поиск и нажал "Создать"
        //     const newRoot = await db.morpheme.create({
        //         data: { value: formData.newRootValue },
        //     })
        //     targetRootId = newRoot.id
        // }
        //
        // // Обновляем связь слова с корнем в таблице lexemes_morphemes
        // if (targetRootId !== currentRootId) {
        //     // Удаляем старую связь
        //     await db.lexemeMorpheme.deleteMany({
        //         where: { lexemeId: wordId },
        //     })
        //
        //     // Если выбран какой-то корень (старый или только что созданный) — создаем новую запись
        //     if (targetRootId) {
        //         await db.lexemeMorpheme.create({
        //             data: {
        //                 lexemeId: wordId,
        //                 rootId: targetRootId,
        //             },
        //         })
        //     }
        // }

        const createdRootIds: number[] = []
        if (formData.newRootValues && formData.newRootValues.length > 0) {
            for (const val of formData.newRootValues) {
                const newRoot = await db.morpheme.create({
                    data: {
                        value: val,
                        type: 0,
                        actionHistory: append(null, buildEntry(author, {
                            value: { old: null, new: val },
                            type: { old: null, new: 0 },
                        })),
                    },
                })
                createdRootIds.push(newRoot.id)
            }
        }

        // 3. Объединяем старые выбранные ID и только что созданные ID корней
        const finalRootIds = [...formData.rootIds, ...createdRootIds]

        // 4. Синхронизируем таблицу связей lexemes_morphemes для этого слова
        // Удаляем все прошлые связи слова с корнями
        await db.lexemeMorpheme.deleteMany({
            where: { lexemeId: wordId },
        })

        // Записываем новые связи
        if (finalRootIds.length > 0) {
            await db.lexemeMorpheme.createMany({
                data: finalRootIds.map((rId) => ({
                    lexemeId: wordId,
                    morphemeId: rId,
                })),
            })
        }

        // Возвращаем пользователя обратно в админку к списку
        redirect("/admin/dictionary")
    }

    if (!wordData) notFound()

    // Трансформируем связи из базы в плоский массив объектов для initialData
    const attachedRoots = (wordData.lexemes_morphemes || [])
        .map((rw) => rw.morpheme)
        .filter((r): r is { id: number; value: string } => !!r && !!r.value)

    return (
        <div className="py-6">
            <ArticleForm
                title={`Редактирование статьи: ${wordData.value || "Без названия"}`}
                submitButtonText="Сохранить изменения"
                initialRoots={initialRoots}
                onSubmit={updateArticle}
                initialData={{
                    word: wordData.value || "",
                    stem: wordData.stem || "",
                    hasAnomalies: wordData.hasAnomalies,
                    inflectionAnomalies: currentAnomalies,
                    translationEn: currentTranslationEn,
                    translationRu: currentTranslationRu,
                    attachedRoots: attachedRoots,
                    isEnVerified: isEnVerified,
                    isRuVerified: isRuVerified,
                }}
            />
        </div>
    )
}
