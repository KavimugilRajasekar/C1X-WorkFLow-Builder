import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs").default;
const replace = require("@rollup/plugin-replace").default;
const typescript = require("@rollup/plugin-typescript").default;
const terser = require("@rollup/plugin-terser").default;

const production = process.env.NODE_ENV === "production";

export default {
  input: "./src/index.ts",
  output: {
    dir: "./dist",
    format: "es",
    sourcemap: true,
    inlineDynamicImports: true,
    preserveModules: false,
  },
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development"),
    }),
    nodeResolve({
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      dedupe: ["react", "react-dom"],
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.lib.json",
      declaration: true,
      declarationDir: "./dist",
      outDir: "./dist",
    }),
    production && terser(),
  ],
};
