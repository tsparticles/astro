#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..", "..");
const nvmrcPath = resolve(rootDir, ".nvmrc");
const packageJsonPath = resolve(rootDir, "package.json");

const normalizeVersion = (value) => value.trim().replace(/^v/, "");
const parseMajor = (value) => {
  const major = Number.parseInt(normalizeVersion(value).split(".")[0] ?? "", 10);

  return Number.isNaN(major) ? null : major;
};
const parsePnpmFromPackageManager = (value) => {
  if (typeof value !== "string" || !value.startsWith("pnpm@")) {
    return null;
  }

  return value.slice("pnpm@".length).split("+")[0]?.trim() ?? null;
};

const expectedNode = normalizeVersion(readFileSync(nvmrcPath, "utf8"));
const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const expectedPnpm = parsePnpmFromPackageManager(pkg.packageManager);

if (!expectedPnpm) {
  console.error("❌ Toolchain precheck failed: root package.json#packageManager must declare pnpm@<version>.");
  process.exit(1);
}

const actualNode = normalizeVersion(process.version);
const actualPnpm = normalizeVersion(execFileSync("pnpm", ["--version"], { cwd: rootDir, encoding: "utf8" }));

const expectedNodeMajor = parseMajor(expectedNode);
const actualNodeMajor = parseMajor(actualNode);

let hasError = false;

if (expectedNodeMajor === null || actualNodeMajor === null || expectedNodeMajor !== actualNodeMajor) {
  hasError = true;
  console.error("❌ Node version mismatch detected before build.");
  console.error(`   expected (.nvmrc major): ${expectedNodeMajor ?? "invalid"} (from ${expectedNode})`);
  console.error(`   actual (process.version): ${actualNodeMajor ?? "invalid"} (from v${actualNode})`);
  console.error("   remediation: run `nvm use` (or install matching Node) before running pnpm build:ci.");
}

if (actualPnpm !== expectedPnpm) {
  hasError = true;
  console.error("❌ pnpm version mismatch detected before build.");
  console.error(`   expected (packageManager): ${expectedPnpm}`);
  console.error(`   actual (pnpm --version): ${actualPnpm}`);
  console.error("   remediation: run `corepack enable && corepack prepare pnpm@" + expectedPnpm + " --activate`.");
}

if (hasError) {
  process.exit(1);
}

console.log("✅ Toolchain precheck passed");
console.log(`   Node: v${actualNode} (expected major ${expectedNodeMajor})`);
console.log(`   pnpm: ${actualPnpm}`);
