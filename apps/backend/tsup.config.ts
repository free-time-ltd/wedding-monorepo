import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs",
  target: "node22",
  platform: "node",
  outDir: "dist",
  splitting: false,
  minify: true,
  clean: true,
  sourcemap: false,
  noExternal: [/^@repo\//],
  outExtension: () => ({ js: ".js" }),
});
