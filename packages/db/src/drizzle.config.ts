import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DB_PATH) {
  throw new Error("Missing DB_PATH");
}

export default defineConfig({
  out: "./drizzle",
  schema: path.join(__dirname, "./schema.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_PATH!,
  },
});
