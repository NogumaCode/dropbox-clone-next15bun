import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  //基本ファイル
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  //ストレージ
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),

  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"),

  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ファイル（またはフォルダ）テーブルに対するリレーション定義
export const filesRelations = relations(files, ({ one, many }) => ({
  // --- 親フォルダとのリレーション ---
  parent: one(files, {
    // このテーブルのどのカラムを使って親を探すのか → parentId が親のIDを保持している
    fields: [files.parentId],
    // 参照先（親）のどのカラムと紐付けるのか → filesテーブルの id カラムと結びつける
    references: [files.id],
  }),
  // --- 子ファイル・フォルダとのリレーション ---
  // 「このファイル（またはフォルダ）に属する子ファイル・フォルダ」を取得するためのリレーション
  children: many(files),
}));

//files テーブルに INSERT するときに必要な型」 を File という名前で定義
export const File = typeof files.$inferInsert;
export const NewFile = typeof files.$inferInsert;
