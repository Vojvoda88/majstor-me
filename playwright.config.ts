import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config – BrziMajstor.ME
 * BaseURL: lokalni dev server (npm run dev).
 * Admin tests use shared storage state from global setup (no per-test login).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    // Uskladiti sa NEXTAUTH_URL / `next dev -p` (npr. 3010 u .env) da kolačići i origin budu isti.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3010",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    /** Mobile QA: iPhone 13–class viewport (390×844) */
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  timeout: 45_000,
  expect: { timeout: 12_000 },
  outputDir: "test-results/",
});
