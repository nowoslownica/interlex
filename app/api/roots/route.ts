import { NextResponse } from "next/server"
import { prismaData as db } from "@/lib/prisma"
import type {Prisma} from "@/prisma/generated/data/client";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("query") || ""

        // Ищем корни, значение которых содержит поисковый запрос
        const roots = await db.root.findMany({
            where: query
                ? {
                    value: {
                        contains: query,
                    },
                }
                : undefined,
            select: {
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
            },
            orderBy: {
                value: "asc",
            },
            take: 30,
        })

        return NextResponse.json(roots)
    } catch (error) {
        console.error("API Roots Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
