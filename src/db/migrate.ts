import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("データベースURLが設定されておりません");
}

async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("全てのマイグレーションを完了しました。");
  } catch (error) {
    console.error("全てのマイグレーションを失敗しました", error);
    process.exit(1); // エラー終了コードでプロセス終了
  }
}
runMigration();
