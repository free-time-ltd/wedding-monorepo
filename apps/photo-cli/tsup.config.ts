import { builtinModules } from "node:module";

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs",
  target: "node22",
  platform: "node",
  outDir: "dist",
  // Single minified file — no code splitting, no sourcemaps.
  splitting: false,
  minify: true,
  sourcemap: false,
  clean: true,
  // Inline workspace packages; keep node builtins and the native sharp binary external.
  noExternal: [/^@repo\//],
  external: [...builtinModules, "sharp"],
});
