const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");

const serverCwd = resolve(process.cwd(), "apps/server");
const passthroughArgs = process.argv.slice(2);

let jestBin;
try {
  jestBin = require.resolve("jest/bin/jest", { paths: [serverCwd] });
} catch (error) {
  console.error("Unable to resolve jest from apps/server dependencies.");
  process.exit(1);
}

const jestArgs = [
  jestBin,
  "--config",
  "./test/jest-e2e.json",
  "--runInBand",
  "test/swap-request.concurrency.e2e-spec.ts",
  ...passthroughArgs,
];

const result = spawnSync(process.execPath, jestArgs, {
  cwd: serverCwd,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
