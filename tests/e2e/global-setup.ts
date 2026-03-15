/**
 * Global setup: create admin storage state so admin tests can reuse auth.
 * Run once before the test suite. Requires dev server at baseURL.
 */
import * as fs from "fs";
import * as path from "path";
import { chromium } from "@playwright/test";
import { CREDS } from "./helpers/credentials";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const storagePath = path.join(process.cwd(), "tests", "e2e", ".auth", "admin.json");

export default async function globalSetup() {
  const dir = path.dirname(storagePath);
  fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login?callbackUrl=${encodeURIComponent("/admin")}`, { waitUntil: "load", timeout: 30_000 });
    await page.getByLabel(/email/i).waitFor({ state: "visible", timeout: 20_000 });
    await page.getByLabel(/email/i).fill(CREDS.admin.email);
    await page.getByLabel(/lozinka|password/i).fill(CREDS.admin.password);
    await page.getByTestId("login-submit").click();
    await page.waitForURL(/\/(admin|\?)/, { timeout: 25_000 });
    if (page.url().includes("/admin")) {
      await context.storageState({ path: storagePath });
    }
  } finally {
    await browser.close();
  }
}
