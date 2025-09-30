import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tableId: integer("table_id").references(() => tablesTable.id, {
    onDelete: "set null",
  }),
});

export const tablesTable = sqliteTable("tables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const userRelations = relations(usersTable, ({ one }) => ({
  table: one(tablesTable),
}));

export const tableRelations = relations(tablesTable, ({ many }) => ({
  users: many(usersTable),
}));

export const roomsTable = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isPrivate: integer("is_private", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: text("room_id")
    .notNull()
    .references(() => roomsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
