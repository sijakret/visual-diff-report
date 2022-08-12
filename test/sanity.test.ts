import { expect } from "chai";
import { createDB, generate } from "../src/generate.js";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

function checkOutput(dir: string) {
  expect(existsSync(join(dir, "baseline/shapes.png"))).to.be.true;
  expect(existsSync(join(dir, "index.html"))).to.be.true;
}

describe("basic report generation", () => {
  it("image collection should work", async function () {
    const db = await createDB({
      rootDir: "test-data",
    });
    expect(db.images).to.deep.equal({
      "baseline/shapes.png": {
        baseline: "baseline/shapes.png",
        current: "current/shapes.png",
        diff: "diff/shapes.png",
        folder: ["", "baseline", "shapes.png"],
      },
    });
  });

  it("generate produce report with copied images", async function () {
    await generate({
      rootDir: "test-data",
      outDir: ".tmp/out",
    });
    checkOutput(".tmp/out");
  });
});

describe("CLI", () => {
  it("cli args", async function () {
    execSync(
      "node ./dist/src/cli.js --rootDir=test-data --outDir=./.tmp/cli/a",
      { stdio: "inherit" }
    );
    checkOutput(".tmp/cli/a");
  });

  it("cli config", async function () {
    execSync("node ./dist/src/cli.js --config=test/config.js", {
      stdio: "inherit",
    });
    checkOutput(".tmp/cli/b");
  });
});
