import { prismaData as db } from "@/lib/prisma"
import ArticleForm from "@/components/ArticleForm"
import {type Prisma} from "@/prisma/generated/data/client";
import {redirect} from "next/navigation";

const rootInclude = {
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
    include: typeof rootInclude
}>

export default async function CreateArticlePage() {
    const pageSize = 30

    // 3. Выполняем запрос к базе данных SQLite
    // Принудительно приводим результат к типу RootWithWords[], чтобы гарантировать совместимость с формой
    const initialRoots = (await db.root.findMany({
        include: rootInclude,
        orderBy: { value: "asc" },
        take: pageSize,
    })) as RootWithWords[]

    async function createArticle(formData: any) {
        "use server"
        // Шаг А: Создаем базовое слово в таблице words
        const newWord = await db.word.create({
            data: {
                value: formData.word,
            },
        })

        // Шаг Б: Создаем для слова контейнер смысловых значений в meanings
        const newMeaning = await db.meaning.create({
            data: {
                wordId: newWord.id,
                meaning: "Основное значение", // Системный маркер или дефолтный текст
            },
        })

        // Шаг В: Записываем английский перевод со своим личным маркером верификации
        await db.en.create({
            data: {
                meaningId: newMeaning.id,
                value: formData.translationEn,
                veryfied: formData.isEnVerified ? 1 : 0, // Приведение boolean к Int (1/0) под SQLite
            },
        })

        // Шаг Г: Записываем русский перевод со своим личным маркером верификации
        await db.ru.create({
            data: {
                meaningId: newMeaning.id,
                value: formData.translationRu,
                veryfied: formData.isRuVerified ? 1 : 0,
            },
        })

        // Шаг Д: Обработка новых виртуальных корней из строки поиска (если были добавлены)
        const createdRootIds: number[] = []
        if (formData.newRootValues && formData.newRootValues.length > 0) {
            for (const val of formData.newRootValues) {
                const newRoot = await db.root.create({
                    data: {
                        value: val,
                        type: 0, // 0 - Корень (дефолтное значение)
                    },
                })
                createdRootIds.push(newRoot.id)
            }
        }

        // Объединяем ID выбранных существующих корней и только что созданных
        const finalRootIds = [...(formData.rootIds || []), ...createdRootIds]

        // Шаг Е: Записываем множественные связи в промежуточную таблицу roots_words
        if (finalRootIds.length > 0) {
            await db.rootWord.createMany({
                data: finalRootIds.map((rId) => ({
                    wordId: newWord.id,
                    rootId: rId,
                })),
            })
        }

        redirect("/admin/dictionary")
    }

    return (
        <div className="py-6">
            <ArticleForm
                title="Создание новой словарной статьи"
                submitButtonText="Создать статью"
                initialRoots={initialRoots}
                onSubmit={createArticle}
            />
        </div>
    )
}

