import {init} from "@/lib/sqlite";

export const getProtoItem = async (id: string) => {
    const db = await init();
    const data = db.prepare('SELECT * FROM proto_slavic_words WHERE id = ?').get(id);
    return data ?? null;
};