import {init} from "@/lib/sqlite";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

/**
 *
 * Вся структура БД (включая FTS5 virtual tables и triggers)
 *   npx prisma migrate deploy --schema=prisma/data.schema.prisma
 */
const initDb = async () => {
    const db = await init();
    console.log("Database initialized via Prisma migrations.");

    // 2. Чтение .sql файла
    const sqlString = fs.readFileSync(path.resolve('./scripts/db/text-tables.sql'), 'utf8');

    // 3. Разделение на отдельные запросы (игнорируем пустые строки)
    const statements = sqlString.split('\n\n').filter(stmt => stmt.trim() !== '');

    // 4. Выполнение в рамках одной транзакции
    const executeMultiple = db.transaction(() => {
        for (const statement of statements) {
            db.prepare(statement).run();
        }
    });

    executeMultiple();

    console.log("Run: npx prisma migrate deploy --schema=prisma/data.schema.prisma");
};

(async () => {
    await initDb();
})();