import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: ["eslint", "@typescript-eslint/utils"],
  splitting: false,
});
