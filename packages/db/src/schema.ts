import { generateId } from "@repo/utils/generateId";
import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  unique,
  index,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name").notNull(),
  extras: integer("extra_people").default(0),
  email: text("email"),
  phone: text("phone"),
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
  createdBy: text("created_by")
    .references(() => usersTable.id, {
      onDelete: "set null",
    })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  isPrivate: integer("is_private", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const userRooms = sqliteTable(
  "user_rooms",
  {
    userId: text("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    roomId: text("room_id").references(() => roomsTable.id, {
      onDelete: "cascade",
    }),
    joinedAt: integer("created_at", { mode: "timestamp_ms" }),
  },
  (table) => ({
    uniqueUserRoom: unique("unique_user_room").on(table.userId, table.roomId),
  })
);

export const messagesTable = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomId: text("room_id")
      .notNull()
      .references(() => roomsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    roomIndex: index("roomIndex").on(table.roomId),
  })
);

export const menuTypes = ["vegan", "regular", "fish"] as const;
export const transportTypes = ["parking", "shuttle", "no"] as const;
export const invitationTable = sqliteTable("invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  attending: integer("attending", { mode: "boolean" }),
  plusOne: integer("plus_one", { mode: "boolean" }),
  menuChoice: text("menu_choice", { enum: menuTypes }),
  transportation: text("transportation", { enum: transportTypes }),
  accommodation: integer("accommodation", { mode: "boolean" }),
  notes: text("notes"),
  views: integer("views").default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const officialPhotosTable = sqliteTable("official_photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  key: text("s3_key").notNull(),
  url: text("url"), // CloudFront CDN URL if any
  title: text("title").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  mimeType: text("mime_type"),
});

export const guestUploadStatus = [
  "pending",
  "processed",
  "approved",
  "rejected",
] as const;
export type GuestUploadStatus = (typeof guestUploadStatus)[number];
export const guestUploadsTable = sqliteTable(
  "guest_uploads",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    s3Key: text("s3_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    url: text("url"), // CloudFront CDN URL if any
    message: text("message"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    status: text("status", { enum: guestUploadStatus }).default("pending"),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    mimeType: text("mime_type"),
    origFilename: text("original_filename"),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("lookupIndex").on(table.s3Key),
    index("browseIndex").on(table.status),
  ]
);

export const cacheTable = sqliteTable(
  "cache",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cacheKey: text("cache_key").unique(),
    cacheValue: text("cache_value", { mode: "json" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("expireIndex").on(table.expiresAt)]
);

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
  invitation: one(invitationTable, {
    fields: [usersTable.id],
    references: [invitationTable.userId],
  }),
  uploads: many(guestUploadsTable),
}));

export const tableRelations = relations(tablesTable, ({ many }) => ({
  guests: many(usersTable),
}));

export const roomRelations = relations(roomsTable, ({ many, one }) => ({
  userRooms: many(userRooms),
  creator: one(usersTable, {
    fields: [roomsTable.createdBy],
    references: [usersTable.id],
  }),
  messages: many(messagesTable),
}));

export const invitationRelations = relations(invitationTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [invitationTable.userId],
    references: [usersTable.id],
  }),
}));

export const guestUploadRelations = relations(guestUploadsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [guestUploadsTable.userId],
    references: [usersTable.id],
  }),
}));
