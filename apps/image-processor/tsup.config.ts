import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs"],
  target: "node20",
  platform: "node",
  sourcemap: false,
  clean: true,
  minify: true,
  bundle: true,
  external: ["sharp"],
  noExternal: ["zod", "@aws-sdk/client-s3"],
});
