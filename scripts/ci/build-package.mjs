#!/usr/bin/env node

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { relative, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..", "..");
const packageDir = resolve(rootDir, "components", "astro");

const args = process.argv.slice(2);
const verifyOnly = args.includes("--verify-only");
const distArg = args.find((arg) => arg.startsWith("--dist="));
const distDir = distArg ? resolve(rootDir, distArg.slice("--dist=".length)) : resolve(packageDir, "dist");

const requiredArtifacts = [
  "index.js",
  "index.d.ts",
  "src/Particles.astro"
];

const toRelative = (path) => relative(rootDir, path);

const verifyArtifacts = () => {
  const missing = requiredArtifacts.filter((artifact) => !existsSync(resolve(distDir, artifact)));

  if (missing.length > 0) {
    console.error("❌ Package artifact verification failed.");
    for (const artifact of missing) {
      console.error(`   missing: ${artifact}`);
    }
    console.error("   remediation: run `pnpm --filter @tsparticles/astro run build:ci` to regenerate dist artifacts.");
    process.exit(1);
  }

  console.log("✅ Package artifact verification passed");
  for (const artifact of requiredArtifacts) {
    console.log(`   found: ${artifact}`);
  }
};

if (verifyOnly) {
  verifyArtifacts();
  process.exit(0);
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(resolve(distDir, "src"), { recursive: true });

execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.build.json"], {
  cwd: packageDir,
  stdio: "inherit"
});

const sourceIndex = resolve(packageDir, "index.ts");
const sourceComponent = resolve(packageDir, "src", "Particles.astro");

copyFileSync(sourceIndex, resolve(distDir, "index.js"));
cpSync(sourceComponent, resolve(distDir, "src", "Particles.astro"));
copyFileSync(resolve(packageDir, "README.md"), resolve(distDir, "README.md"));
copyFileSync(resolve(packageDir, "CHANGELOG.md"), resolve(distDir, "CHANGELOG.md"));
copyFileSync(resolve(rootDir, "LICENSE"), resolve(distDir, "LICENSE"));

const pkg = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));
const minimalPkg = {
  name: pkg.name,
  version: pkg.version,
  type: "module",
  exports: {
    ".": "./index.js"
  },
  types: "./index.d.ts"
};

writeFileSync(resolve(distDir, "package.json"), `${JSON.stringify(minimalPkg, null, 2)}\n`);

verifyArtifacts();
console.log(`✅ Build artifacts generated at ${toRelative(distDir)}`);
