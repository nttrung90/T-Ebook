#!/usr/bin/env node
/**
 * Cross-platform Gradle wrapper launcher.
 *
 * Usage:
 *   node scripts/android-build.mjs assembleDebug
 *   node scripts/android-build.mjs bundleRelease
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const task = process.argv[2] || "assembleDebug";
const androidDir = resolve(process.cwd(), "android");

if (!existsSync(androidDir)) {
  console.error(
    "Android project not found. Run `npx cap add android` once before building."
  );
  process.exit(1);
}

const isWindows = process.platform === "win32";
const wrapper = isWindows ? "gradlew.bat" : "./gradlew";

// Auto-detect JAVA_HOME if missing
if (!process.env.JAVA_HOME || !existsSync(process.env.JAVA_HOME)) {
  const candidateHomes = [
    resolve(process.env.USERPROFILE || "", ".jdks/jbr-21.0.11"),
    resolve(process.env.LOCALAPPDATA || "", "Programs/Android Studio/jbr"),
    "C:/Program Files/Android/Android Studio/jbr",
    "C:/Program Files/Eclipse Adoptium/jdk-21",
    "C:/Program Files/Java/jdk-21",
  ];
  for (const candidate of candidateHomes) {
    if (existsSync(candidate)) {
      process.env.JAVA_HOME = candidate;
      const binDir = resolve(candidate, "bin");
      process.env.PATH = `${binDir}${isWindows ? ";" : ":"}${process.env.PATH}`;
      break;
    }
  }
}

const result = spawnSync(wrapper, [task], {
  cwd: androidDir,
  stdio: "inherit",
  shell: isWindows,
  env: process.env,
});

process.exit(result.status ?? 1);
