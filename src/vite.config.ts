import VisualDiffAppPlugin from "./plugin.js";
import { defineConfig } from "vite";
import { VisualDiffReportConfig } from "generate.js";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * spits out vite config given visual diff config
 */
export default (
  config: Partial<VisualDiffReportConfig> = {
    rootDir: "test-data",
  }
) =>
  defineConfig({
    build: {
      outDir: "../dist/app",
      emptyOutDir: true,
      sourcemap: true,
    },
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
    plugins: [VisualDiffAppPlugin(config), viteSingleFile()],
    root: "./src/app",
  });
