import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  input: "src/index.ts",
  output: [{
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: !isProd,
  },{
    file: 'dist/index.mjs',
    format: 'es',
    sourcemap: !isProd,
  }],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist",
      rootDir: "./src",
    }),
    terser(),
  ],
});