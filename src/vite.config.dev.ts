/** @type {import('vite').UserConfig} */
import { UserConfig } from "vite";
import config from "./vite.config.js";

const cfg = config({
  rootDir: "test-data",
  verbose: true,
}) as UserConfig;
cfg.publicDir = "../../test-data";
cfg.build = cfg.build || {};
cfg.build.watch = {};
export default cfg;
