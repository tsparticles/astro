import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const repoRoot = resolve(import.meta.dirname, "..", "..", "..");

const run = (componentPkg, appPkg) =>
  spawnSync("node", ["scripts/ci/check-dependency-drift.mjs", `--component=${componentPkg}`, `--app=${appPkg}`], {
    cwd: repoRoot,
    encoding: "utf8"
  });

const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

test("exits 0 when shared runtime dependency majors match", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-dep-drift-"));

  try {
    const componentPath = join(tempDir, "component.json");
    const appPath = join(tempDir, "app.json");

    writeJson(componentPath, { dependencies: { "@tsparticles/engine": "^4.2.0", foo: "^1.0.0" } });
    writeJson(appPath, { dependencies: { "@tsparticles/engine": "~4.9.1", foo: "4.5.0" } });

    const result = run(componentPath, appPath);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("exits non-zero with per-package mismatch details for major drift", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-dep-drift-"));

  try {
    const componentPath = join(tempDir, "component.json");
    const appPath = join(tempDir, "app.json");

    writeJson(componentPath, { dependencies: { "@tsparticles/engine": "^4.2.0" } });
    writeJson(appPath, { dependencies: { "@tsparticles/engine": "^3.9.1" } });

    const result = run(componentPath, appPath);

    assert.notEqual(result.status, 0, "Expected failure for major mismatch");
    assert.match(result.stderr, /@tsparticles\/engine/);
    assert.match(result.stderr, /component/i);
    assert.match(result.stderr, /app/i);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("ignores minor and patch differences when majors match", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-dep-drift-"));

  try {
    const componentPath = join(tempDir, "component.json");
    const appPath = join(tempDir, "app.json");

    writeJson(componentPath, { dependencies: { "@tsparticles/engine": "^4.0.0-beta.11" } });
    writeJson(appPath, { dependencies: { "@tsparticles/engine": "4.9.0" } });

    const result = run(componentPath, appPath);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
