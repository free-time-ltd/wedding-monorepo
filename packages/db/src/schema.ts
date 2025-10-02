import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  extras: integer("extra_people").default(0),
  tableId: integer("table_id").references(() => tablesTable.id, {
    onDelete: "set null",
  }),
});

export const tablesTable = sqliteTable("tables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  label: text("label"),
});

export const roomsTable = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isPrivate: integer("is_private", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const userRooms = sqliteTable("user_rooms", {
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  roomId: text("room_id").references(() => roomsTable.id, {
    onDelete: "cascade",
  }),
  joinedAt: integer("created_at", { mode: "timestamp_ms" }),
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

export const userRoomsRelations = relations(userRooms, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRooms.userId],
    references: [usersTable.id],
  }),
  room: one(roomsTable, {
    fields: [userRooms.roomId],
    references: [roomsTable.id],
  }),
}));

export const userRelations = relations(usersTable, ({ one, many }) => ({
  table: one(tablesTable, {
    fields: [usersTable.tableId],
    references: [tablesTable.id],
  }),
  userRooms: many(userRooms),
}));

export const tableRelations = relations(tablesTable, ({ many }) => ({
  guests: many(usersTable),
}));

export const roomRelations = relations(roomsTable, ({ many }) => ({
  userRooms: many(userRooms),
}));
