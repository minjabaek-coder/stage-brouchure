import { defineConfig, devices } from "@playwright/test";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  "postgresql://kai@localhost:5432/eoullim_test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  // Migrates + seeds eoullim_test before any spec runs (S05+).
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] }, // iPhone 13 device profile uses webkit;
      // Pixel 7 uses chromium with mobile viewport, matching project name
    },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    // Always start a fresh server for tests so DATABASE_URL injection takes
    // effect (a reused dev server would still be pointed at eoullim_dev).
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
    },
  },
});
