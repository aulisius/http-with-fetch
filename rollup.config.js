import filesize from "rollup-plugin-filesize";
import pkg from "./package.json";

let createBuild = ({ format }) => ({
  input: pkg.source,
  external: Object.keys(pkg.peerDependencies || {}),
  output: { file: `lib/${format}.js`, format },
  plugins: [filesize()]
});

export default [createBuild({ format: "cjs" }), createBuild({ format: "es" })];
