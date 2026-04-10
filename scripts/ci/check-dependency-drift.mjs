#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..", "..");

const args = process.argv.slice(2);
const argValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);

const componentPath = resolve(rootDir, argValue("--component") ?? "components/astro/package.json");
const appPath = resolve(rootDir, argValue("--app") ?? "apps/astro/package.json");

const readManifest = (path) => JSON.parse(readFileSync(path, "utf8"));
const normalizeDeps = (pkg) => ({ ...(pkg.dependencies ?? {}) });

const parseMajor = (range) => {
  if (typeof range !== "string") {
    return null;
  }

  const match = range.match(/\d+/);

  return match ? Number.parseInt(match[0], 10) : null;
};

const componentPkg = readManifest(componentPath);
const appPkg = readManifest(appPath);

const componentDeps = normalizeDeps(componentPkg);
const appDeps = normalizeDeps(appPkg);

const shared = Object.keys(componentDeps).filter((name) => Object.hasOwn(appDeps, name));

const mismatches = [];

for (const dep of shared) {
  const componentRange = componentDeps[dep];
  const appRange = appDeps[dep];
  const componentMajor = parseMajor(componentRange);
  const appMajor = parseMajor(appRange);

  if (componentMajor === null || appMajor === null) {
    continue;
  }

  if (componentMajor !== appMajor) {
    mismatches.push({
      dependency: dep,
      componentRange,
      appRange,
      componentMajor,
      appMajor
    });
  }
}

if (mismatches.length > 0) {
  console.error("❌ Dependency major-version drift detected between components/astro and apps/astro.");
  console.error("   mismatches:");
  for (const mismatch of mismatches) {
    console.error(
      `   - ${mismatch.dependency}: component=${mismatch.componentRange} (major ${mismatch.componentMajor}), app=${mismatch.appRange} (major ${mismatch.appMajor})`
    );
  }
  console.error("   remediation: align shared runtime dependency majors in components/astro/package.json and apps/astro/package.json.");
  process.exit(1);
}

console.log("✅ Dependency major-version alignment check passed");
console.log(`   shared dependencies checked: ${shared.length}`);
