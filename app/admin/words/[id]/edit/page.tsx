import { prismaData as db } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { type Prisma } from "@/prisma/generated/data/client"
import ArticleForm from "@/components/ArticleForm"

const rootSelectStructure = {
    id: true,
    value: true,
    roots_words: {
        take: 10,
        select: {
            id: true,
            word: {
                select: {
                    id: true,
                    value: true,
                },
            },
        },
    },
}

export type RootWithWords = Prisma.RootGetPayload<{
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
        db.word.findUnique({
            where: { id: wordId },
            include: {
                // Подгружаем переводы через таблицу Meaning и языковые таблицы
                meanings: {
                    include: {
                        en_word: true,
                        ru_word: true,
                    },
                },
                // Подгружаем текущую связь с корнем, чтобы знать, какой корень выбран
                roots_words: {
                    take: 1,
                    select: {
                        rootId: true,
                        root: {
                            select: {
                                value: true,
                            },
                        },
                    },
                },
            },
        }),
        db.root.findMany({
            select: rootSelectStructure,
            orderBy: { value: "asc" },
            take: 30,
        }) as Promise<RootWithWords[]>,
    ])

    if (!wordData) notFound()

    // Извлекаем текущие переводы (En и Ru) из структуры связей вашей БД
    const firstMeaning = wordData.meanings?.[0]
    const currentTranslationEn = firstMeaning?.en_word?.[0]?.value || ""
    const isEnVerified = firstMeaning?.en_word?.[0]?.veryfied === 1

    const currentTranslationRu = firstMeaning?.ru_word?.[0]?.value || ""
    const isRuVerified = firstMeaning?.ru_word?.[0]?.veryfied === 1

    // 3. Функция обновления статьи (Server Action)
    async function updateArticle(formData: any) {
        "use server"

        // Обновляем базовое слово
        await db.word.update({
            where: { id: wordId },
            data: {
                value: formData.word,
            },
        })

        // Логика обновления/создания корня
        // let targetRootId = formData.rootId
        //
        // if (formData.newRootValue) {
        //     // Если администратор ввел новый корень в поиск и нажал "Создать"
        //     const newRoot = await db.root.create({
        //         data: { value: formData.newRootValue },
        //     })
        //     targetRootId = newRoot.id
        // }
        //
        // // Обновляем связь слова с корнем в таблице roots_words
        // if (targetRootId !== currentRootId) {
        //     // Удаляем старую связь
        //     await db.rootWord.deleteMany({
        //         where: { wordId: wordId },
        //     })
        //
        //     // Если выбран какой-то корень (старый или только что созданный) — создаем новую запись
        //     if (targetRootId) {
        //         await db.rootWord.create({
        //             data: {
        //                 wordId: wordId,
        //                 rootId: targetRootId,
        //             },
        //         })
        //     }
        // }

        const createdRootIds: number[] = []
        if (formData.newRootValues && formData.newRootValues.length > 0) {
            for (const val of formData.newRootValues) {
                const newRoot = await db.root.create({
                    data: {
                        value: val,
                        type: 0 // В будущем здесь можно передавать тип морфемы (0-корень, 1-приставка)
                    },
                })
                createdRootIds.push(newRoot.id)
            }
        }

        // 3. Объединяем старые выбранные ID и только что созданные ID корней
        const finalRootIds = [...formData.rootIds, ...createdRootIds]

        // 4. Синхронизируем таблицу связей roots_words для этого слова
        // Удаляем все прошлые связи слова с корнями
        await db.rootWord.deleteMany({
            where: { wordId: wordId },
        })

        // Записываем новые связи
        if (finalRootIds.length > 0) {
            await db.rootWord.createMany({
                data: finalRootIds.map((rId) => ({
                    wordId: wordId,
                    rootId: rId,
                })),
            })
        }

        // Возвращаем пользователя обратно в админку к списку
        redirect("/admin/dictionary")
    }

    if (!wordData) notFound()

    // Трансформируем связи из базы в плоский массив объектов для initialData
    const attachedRoots = (wordData.roots_words || [])
        .map((rw) => rw.root)
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
