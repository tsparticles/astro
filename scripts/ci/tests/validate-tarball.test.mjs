import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const repoRoot = resolve(import.meta.dirname, "..", "..", "..");

const run = (args = []) =>
  spawnSync("node", ["scripts/ci/validate-tarball.mjs", ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });

const writePackJson = (dir, files) => {
  const path = join(dir, "pack.json");
  const payload = {
    name: "@tsparticles/astro",
    version: "2.8.0",
    filename: "tsparticles-astro-2.8.0.tgz",
    files: files.map((file) => ({ path: file }))
  };

  writeFileSync(path, JSON.stringify(payload, null, 2));

  return path;
};

test("validator passes when exports/files/types contract is satisfied", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-tarball-validator-"));

  try {
    const packPath = writePackJson(tempDir, [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/src/Particles.astro",
      "dist/README.md",
      "dist/CHANGELOG.md",
      "dist/LICENSE",
      "dist/package.json",
      "package.json",
      "README.md"
    ]);
    const reportPath = join(tempDir, "report.json");
    const result = run([`--pack-json=${packPath}`, `--report=${reportPath}`]);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Tarball validation passed/);
    assert.equal(JSON.parse(readFileSync(reportPath, "utf8")).ok, true);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validator fails when unexpected files are present", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-tarball-validator-"));

  try {
    const packPath = writePackJson(tempDir, [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/src/Particles.astro",
      "dist/README.md",
      "dist/CHANGELOG.md",
      "dist/LICENSE",
      "dist/package.json",
      "package.json",
      "README.md",
      "dist/unexpected.js"
    ]);
    const result = run([`--pack-json=${packPath}`]);

    assert.notEqual(result.status, 0, "Expected non-zero status when unexpected files are included");
    assert.match(result.stderr, /unexpected/i);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validator writes JSON report and concise summary", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "astro-tarball-validator-"));

  try {
    const packPath = writePackJson(tempDir, ["dist/index.js"]);
    const reportPath = join(tempDir, "report.json");
    const result = run([`--pack-json=${packPath}`, `--report=${reportPath}`]);

    assert.notEqual(result.status, 0, "Expected failure with missing required files");
    assert.match(result.stderr, /Tarball validation failed/);
    assert.equal(typeof JSON.parse(readFileSync(reportPath, "utf8")).summary, "string");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
