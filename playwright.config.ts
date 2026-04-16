import { defineConfig, devices } from "@playwright/test";
import { playwrightBaseURL } from "./tests/e2e/helpers/playwright-base-url";

const ADMIN_STORAGE = "tests/e2e/.auth/admin.json";

/**
 * E2E config – BrziMajstor.ME
 * BaseURL: lokalni dev server (npm run dev).
 * `global-setup.ts` snima admin sesiju; `admin.spec.ts` koristi `storageState` (bez login u svakom testu).
 */
export default defineConfig({
  globalSetup: "./tests/e2e/global-setup.ts",
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    // Uskladiti sa NEXTAUTH_URL / `next dev -p` (npr. 3010 u .env) da kolačići i origin budu isti.
    baseURL: playwrightBaseURL(),
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/admin.spec.ts",
    },
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_STORAGE,
      },
      testMatch: "**/admin.spec.ts",
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: "**/admin.spec.ts",
    },
    {
      name: "firefox-admin",
      use: {
        ...devices["Desktop Firefox"],
        storageState: ADMIN_STORAGE,
      },
      testMatch: "**/admin.spec.ts",
    },
    /** Mobile QA: iPhone 13–class viewport (390×844) */
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      testIgnore: "**/admin.spec.ts",
    },
  ],
  timeout: 45_000,
  expect: { timeout: 12_000 },
  outputDir: "test-results/",
});
