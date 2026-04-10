import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname, "..", "..", "..");

const run = (args = []) =>
  spawnSync("node", ["scripts/ci/build-package.mjs", ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });

test("build-package generates dist entry and declarations", () => {
  const result = run();

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("build-package verify mode fails when required artifact is missing", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-build-package-test-"));

  try {
    const result = run(["--verify-only", `--dist=${tempDir}`]);

    assert.notEqual(result.status, 0, "Expected verify-only mode to fail when artifacts are missing");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
