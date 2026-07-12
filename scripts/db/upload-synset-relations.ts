import * as path from 'path'
import fs from 'fs'
import { init } from "@/lib/sqlite"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

process.env.DATA_DATABASE_URL = `file:${path.resolve(process.cwd(), 'interlex.db')}`

interface SynsetEntry {
    meaningId: number
    wordId: number
    isvWord: string
    synset_data: {
        hypernyms: string[]
        hyponyms: string[]
        meronyms: string[]
        holonyms: string[]
        related: string[]
        causes: string[]
        effects: string[]
        premises: string[]
        conclusions: string[]
    }
}

const TABLE_MAP: Record<string, string> = {
    hypernyms: "hypernyms",
    hyponyms: "hyponyms",
    meronyms: "meronyms",
    holonyms: "holonyms",
    related: "related_words",
    causes: "causes",
    effects: "effects",
    premises: "premises",
    conclusions: "conclusions",
}

async function main() {
    const { prismaData: db } = await import('@/lib/prisma')

    const inputPath = path.resolve(process.cwd(), './scripts/python/words_enriched.json')
    const data: SynsetEntry[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))

    const dbSimple = await init()

    // Build lookup: Russian word → meaningId
    const allRu = dbSimple.prepare(`SELECT value, meaningId FROM ru`).all() as { value: string; meaningId: number }[]
    const ruLookup = new Map<string, number>()
    for (const row of allRu) {
        ruLookup.set(row.value, row.meaningId)
    }
    console.error(`Loaded ${ruLookup.size} ru entries`)

    // Collect inserts per table
    const inserts: Record<string, Set<string>> = {}
    for (const tableName of Object.values(TABLE_MAP)) {
        inserts[tableName] = new Set()
    }

    let entriesWithData = 0

    for (const entry of data) {
        if (!entry.meaningId) continue
        const synsetData = entry.synset_data
        if (!synsetData) continue

        entriesWithData++

        for (const [jsonKey, tableName] of Object.entries(TABLE_MAP)) {
            const words = (synsetData as any)[jsonKey] as string[] | undefined
            if (!words || words.length === 0) continue

            for (const word of words) {
                const targetMeaningId = ruLookup.get(word)
                if (targetMeaningId !== undefined) {
                    inserts[tableName].add(`${entry.meaningId},${targetMeaningId}`)
                }
            }
        }
    }

    console.error(`Processed ${entriesWithData} entries with synset_data`)

    // Write inserts per table in a single transaction
    const writeAll = dbSimple.transaction(() => {
        for (const [tableName, pairs] of Object.entries(inserts)) {
            if (pairs.size === 0) continue

            // Clear existing data for clean import
            dbSimple.prepare(`DELETE FROM ${tableName}`).run()

            const insert = dbSimple.prepare(`INSERT INTO ${tableName} (sourceId, targetId) VALUES (?, ?)`)
            let count = 0
            for (const pair of pairs) {
                const [sourceId, targetId] = pair.split(',').map(Number)
                insert.run(sourceId, targetId)
                count++
            }
            console.error(`Inserted ${count} rows into ${tableName}`)
        }
    })

    writeAll()

    await db.$disconnect()
}

main().catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
})