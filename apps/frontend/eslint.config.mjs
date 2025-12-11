import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import {nextJsConfig} from "@repo/eslint-config/next-js"

const eslintConfig = [...next, ...nextCoreWebVitals, ...nextTypescript, ...nextJsConfig, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
}];

export default eslintConfig