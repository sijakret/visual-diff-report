import { VisualDiffReportConfig, createDB } from "./generate.js";

export default function VisualDiffAppPlugin(
  config: Partial<VisualDiffReportConfig>
) {
  return {
    name: "visual-diff-app-plugin", // this name will show up in warnings and errors
    resolveId(source: string) {
      if (source === "visual-diff-db") {
        return source; // this signals that rollup should not ask other plugins or check the file system to find this id
      }
      return null; // other ids should be handled as usually
    },
    async load(id: string) {
      if (id === "visual-diff-db") {
        return `
        /*
        const config = ${JSON.stringify(config)}
        */;
        export default ${JSON.stringify(await createDB(config))}`; // the source code for "virtual-module"
      }
      return null; // other ids should be handled as usually
    },
  };
}
