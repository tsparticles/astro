#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..", "..");
const packageDir = resolve(rootDir, "components", "astro");
const packageJsonPath = resolve(packageDir, "package.json");
const expectedManifestPath = resolve(rootDir, "scripts", "ci", "tarball-expected-manifest.json");

const args = process.argv.slice(2);
const argValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);

const reportPath = resolve(rootDir, argValue("--report") ?? ".planning/tmp/tarball-validation-report.json");
const packJsonPath = argValue("--pack-json") ? resolve(rootDir, argValue("--pack-json")) : null;

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

const collectExportTargets = (exportsValue) => {
  if (!exportsValue) {
    return [];
  }
  if (typeof exportsValue === "string") {
    return [exportsValue];
  }
  if (typeof exportsValue === "object") {
    return Object.values(exportsValue).flatMap((value) => collectExportTargets(value));
  }

  return [];
};

const readPackResult = () => {
  if (packJsonPath) {
    return JSON.parse(readFileSync(packJsonPath, "utf8"));
  }

  const output = execFileSync("pnpm", ["--dir", packageDir, "pack", "--json"], {
    cwd: rootDir,
    encoding: "utf8"
  });

  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unable to parse pnpm pack --json output");
  }

  return JSON.parse(output.slice(start, end + 1));
};

const packed = readPackResult();
const packedFiles = new Set((packed.files ?? []).map((entry) => entry.path));

const exportTargets = collectExportTargets(packageJson.exports).map((target) => target.replace(/^\.\//, ""));
const typesTarget = typeof packageJson.types === "string" ? packageJson.types.replace(/^\.\//, "") : null;

const requiredFiles = [
  ...exportTargets,
  ...(typesTarget ? [typesTarget] : []),
  "dist/src/Particles.astro",
  "dist/README.md",
  "dist/CHANGELOG.md",
  "dist/LICENSE",
  "dist/package.json",
  "package.json",
  "README.md"
];

const allowlist = new Set(requiredFiles);

const missingFiles = requiredFiles.filter((file) => !packedFiles.has(file));
const unexpectedFiles = [...packedFiles].filter((file) => !allowlist.has(file));

const expectedManifest = JSON.parse(readFileSync(expectedManifestPath, "utf8"));
const expectedFiles = new Set(Array.isArray(expectedManifest.files) ? expectedManifest.files : []);
const currentFiles = new Set([...packedFiles]);

const addedFromSnapshot = [...currentFiles].filter((file) => !expectedFiles.has(file)).sort();
const removedFromSnapshot = [...expectedFiles].filter((file) => !currentFiles.has(file)).sort();

const ok =
  missingFiles.length === 0 &&
  unexpectedFiles.length === 0 &&
  addedFromSnapshot.length === 0 &&
  removedFromSnapshot.length === 0;
const summary = ok
  ? `Tarball validation passed (${packedFiles.size} files checked)`
  : `Tarball validation failed (${missingFiles.length} missing, ${unexpectedFiles.length} unexpected, ${addedFromSnapshot.length} added, ${removedFromSnapshot.length} removed)`;

const report = {
  ok,
  package: packed.name,
  version: packed.version,
  tarball: packed.filename,
  checkedAt: new Date().toISOString(),
  summary,
  requiredFiles,
  packedFiles: [...packedFiles].sort(),
  missingFiles: missingFiles.sort(),
  unexpectedFiles: unexpectedFiles.sort(),
  expectedManifestPath,
  addedFromSnapshot,
  removedFromSnapshot
};

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (!ok) {
  console.error("❌ Tarball validation failed");
  if (missingFiles.length > 0) {
    console.error("   missing required files:");
    for (const file of missingFiles) {
      console.error(`   - ${file}`);
    }
  }

  if (unexpectedFiles.length > 0) {
    console.error("   unexpected files:");
    for (const file of unexpectedFiles) {
      console.error(`   - ${file}`);
    }
  }

  if (addedFromSnapshot.length > 0 || removedFromSnapshot.length > 0) {
    console.error("   snapshot drift:");
    for (const file of addedFromSnapshot) {
      console.error(`   + ${file}`);
    }
    for (const file of removedFromSnapshot) {
      console.error(`   - ${file}`);
    }
  }

  console.error(`   report: ${reportPath}`);
  console.error("   remediation: if this drift is intentional, regenerate scripts/ci/tarball-expected-manifest.json with the approved tarball file list in sorted order.");
  process.exit(1);
}

console.log("✅ Tarball validation passed");
console.log(`   package: ${packed.name}@${packed.version}`);
console.log(`   files checked: ${packedFiles.size}`);
console.log(`   report: ${reportPath}`);
