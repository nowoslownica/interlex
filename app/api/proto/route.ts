import {NextRequest, NextResponse} from "next/server";
import {init} from "@/lib/sqlite";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const query = url.searchParams.get('search') || '';
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const db = await init();

    let items: any[];
    let total: number;

    if (query) {
        const like = `%${query}%`;
        items = db.prepare(
            'SELECT * FROM proto_slavic_words WHERE lemma LIKE ? ORDER BY lemma ASC LIMIT ? OFFSET ?'
        ).all(like, limit, offset);
        total = (db.prepare(
            'SELECT COUNT(*) as count FROM proto_slavic_words WHERE lemma LIKE ?'
        ).get(like) as any).count;
    } else {
        items = db.prepare(
            'SELECT * FROM proto_slavic_words ORDER BY lemma ASC LIMIT ? OFFSET ?'
        ).all(limit, offset);
        total = (db.prepare(
            'SELECT COUNT(*) as count FROM proto_slavic_words'
        ).get() as any).count;
    }

    return NextResponse.json({items, total}, {status: 200});
}