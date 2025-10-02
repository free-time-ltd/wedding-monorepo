import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

if (!process.env?.DB_PATH) {
  throw new Error("Missing env variable DB_PATH");
}

export const db = drizzle(process.env?.DB_PATH, { schema });
