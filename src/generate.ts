import glob, { Options as FastGlobOptions } from "fast-glob";
import { normalize, resolve, join, isAbsolute } from "path";
import { existsSync } from "fs";
import fsExtra from "fs-extra";
import { VisualDiffImage, VisualDiffReportDB } from "shared";
import { build, UserConfig } from "vite";
import config from "./vite.config.js";
import chalk from "chalk";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * main config options
 */
export interface VisualDiffReportConfig {
  /**
   * title of report
   */
  reportTitle: string;

  /**
   * root directory where images are found
   */
  rootDir: string;

  /**
   * optional
   * output directory (defaults to root dir)
   */
  outDir?: string;

  /**
   * optional
   * enable verbose logging
   */
  verbose?: boolean;

  /**
   * optional
   * additional FastGlobOptions to discover image files
   */
  globImagesOptions?: FastGlobOptions;

  /**
   * optional
   * glob pattern for image files
   */
  globImages?: string | string[]; // relative to root dir

  /**
   * optional
   * function must return true for paths of "baseline" images
   */
  isBaseline?: (path: string) => boolean;

  /**
   * optional
   * function must return true for paths of "current" images
   */
  isCurrent?: (path: string) => boolean;

  /**
   * optional
   * function must map "baseline" image to corresponding "current" image
   */
  baselineToCurrent?: (baselinePath: string) => string;

  /**
   * optional
   * function must map "current" image to corresponding "baseline" image
   */
  currentToBaseline?: (currentPath: string) => string;

  /**
   * optional
   * function must map "baseline" image to corresponding "diff" image
   */
  baselineToDiff: (currentPath: string) => string;

  /**
   * optional
   * function must map "baseline" image to corresponding "current" image
   */
  fold: (path: string) => string[];
}

/**
 * default options
 */
export const defaultOptions = {
  reportTitle: "Unnamed Diff",
  outDir: "",
  rootDir: process.cwd(),
  globImages: "**/*.png",
  verbose: false,
  isBaseline: (path: string) => !!norm(path).match(/(\/|^)baseline\//),
  isCurrent: (path: string) => !!norm(path).match(/(\/|^)current\//),
  baselineToCurrent: (path: string) =>
    norm(path).replace(/(baseline\/)/, `current/`),
  baselineToDiff: (path: string) => norm(path).replace(/(baseline\/)/, `diff/`),
  currentToBaseline: (path: string) =>
    norm(path).replace(/(current\/)/, `baseline/`),
  fold: (path: string) => {
    return path
      .replace(/(current\/)|(baseline\/)|(diff\/)/i, "")
      .split("/")
      .filter((i) => !!i);
  },
};

/**
 *
 * @param opts Options
 */
export async function generate(opts: Partial<VisualDiffReportConfig>) {
  const completedOpts: VisualDiffReportConfig = {
    ...defaultOptions,
    ...opts,
  };

  if (!completedOpts.outDir) {
    completedOpts.outDir = completedOpts.rootDir;
  }

  const outDir = isAbsolute(completedOpts.outDir)
    ? completedOpts.outDir
    : join(process.cwd(), completedOpts.outDir);

  if (completedOpts.verbose) {
    console.log(chalk.blue("outDir"), outDir);
  }
  // build app
  const cfg = config(opts) as UserConfig;
  cfg.build = cfg.build || {};
  cfg.build.outDir = outDir;
  cfg.root = resolve(__dirname, "../../src/app");
  await build(cfg as UserConfig);

  const db = await createDB(completedOpts);

  // copy over images in case root dir and output dir are not the same
  if (resolve(outDir) !== resolve(completedOpts.rootDir)) {
    for (const i in db.images) {
      const { baseline, current, diff } = db.images[i];
      baseline &&
        fsExtra.copySync(
          join(completedOpts.rootDir, baseline),
          join(outDir, baseline)
        );
      current &&
        fsExtra.copySync(
          join(completedOpts.rootDir, current),
          join(outDir, current)
        );
      diff &&
        fsExtra.copySync(join(completedOpts.rootDir, diff), join(outDir, diff));
    }
  }
}

/**
 * create database of all relevant images
 * @param opts Options
 */
export async function createDB(
  opts: Partial<VisualDiffReportConfig>
): Promise<VisualDiffReportDB> {
  let {
    globImages,
    globImagesOptions,
    reportTitle,
    rootDir,
    verbose,
    isBaseline,
    isCurrent,
    baselineToCurrent,
    baselineToDiff,
    currentToBaseline,
    fold,
  } = {
    ...defaultOptions,
    ...opts,
  };

  rootDir = norm(resolve(rootDir));
  const stream = glob.stream(globImages, {
    cwd: rootDir,
    ...globImagesOptions,
  });

  const db: VisualDiffReportDB = {
    title: reportTitle,
    rootDir,
    images: {},
  };
  for await (const entry of stream) {
    const image: VisualDiffImage = { folder: [] };
    const path = entry.toString();
    let key = "";
    if (isBaseline(path)) {
      key = image.baseline = path;
      image.current = baselineToCurrent(path);
      if (!existsSync(join(db.rootDir, image.current))) {
        delete image.current;
      } else {
        image.diff = baselineToDiff(image.baseline);
      }
    } else if (isCurrent(path)) {
      key = image.baseline = currentToBaseline(path);
      image.current = path;
      if (!existsSync(join(db.rootDir, image.baseline))) {
        delete image.baseline;
      } else {
        image.diff = baselineToDiff(image.baseline);
      }
    }

    if (verbose) {
      const type = `determined as ${chalk.cyan(
        isBaseline(path) ? "baseline" : isCurrent(path) ? "current" : "diff"
      )}`;
      console.log(chalk.blue("processed"), path, type);
    }
    if (!key) {
      // diff image
      continue;
    }

    if (image.diff && !existsSync(join(db.rootDir, image.diff))) {
      delete image.diff;
    }
    // image.baseline or image.current WILL be defined here!
    image.folder = fold(image.baseline || image.current || "");
    db.images[key] = image;
  }

  return db;
}

function norm(path: string) {
  return normalize(path).replace(/\\/g, "/");
}
