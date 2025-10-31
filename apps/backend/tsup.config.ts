import { defineConfig } from "tsup";
import { builtinModules } from "module";

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
  external: [...builtinModules, "cookie", "zod"],
  outExtension: () => ({ js: ".js" }),
});
