import { execSync } from "node:child_process";

/**
 * Playwright global setup — applies migrations + seed to the eoullim_test
 * database before any spec runs. The test DB is fully reset on each run so
 * specs do not leak state into one another.
 *
 * Why this lives outside `tests/e2e/` — Playwright's globalSetup is loaded by
 * the runner itself, not as a spec, and shouldn't be picked up by `testDir`.
 */
const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  "postgresql://kai@localhost:5432/eoullim_test";

function run(cmd: string) {
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      // User consented (2026-05-11) to resetting eoullim_test on each run; this
      // env satisfies Prisma 6's AI-action guard for migrate reset.
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:
        "네, eoullim_test 만 reset 허용",
    },
  });
}

export default async function globalSetup() {
  if (!TEST_DATABASE_URL.includes("eoullim_test")) {
    throw new Error(
      `Refusing to run reset — DATABASE_URL must target eoullim_test (got: ${TEST_DATABASE_URL})`,
    );
  }
  console.log("[playwright] preparing eoullim_test DB…");
  run("pnpm exec prisma migrate reset --force --skip-seed");
  run("node --import tsx prisma/seed.ts");
}
