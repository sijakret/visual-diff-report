import VisualDiffAppPlugin from "./plugin.js";
import { defineConfig } from "vite";
import { VisualDiffReportConfig } from "generate.js";

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
      sourcemap: true,
    },
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
    plugins: [VisualDiffAppPlugin(config)],
    root: "./src/app",
  });
