import filesize from "rollup-plugin-filesize";
import pkg from "./package.json";

let createBuild = (format, file) => ({
  input: pkg.source,
  external: Object.keys(pkg.peerDependencies),
  output: { file, format },
  plugins: [filesize()]
});

export default [createBuild("cjs", pkg.main), createBuild("es", pkg.module)];
