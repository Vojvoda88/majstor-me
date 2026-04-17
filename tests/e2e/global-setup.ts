/**
 * Jednom pre suite-a: admin prijava i snimanje `storageState` za `admin.spec.ts`.
 * Zahtijeva pokrenut app na `PLAYWRIGHT_BASE_URL` (default http://localhost:3010).
 */
import * as fs from "fs";
import * as path from "path";
import { chromium } from "@playwright/test";
import { fillLoginForm } from "./helpers/auth";
import { CREDS } from "./helpers/credentials";
import { playwrightBaseURL } from "./helpers/playwright-base-url";

const storagePath = path.join(process.cwd(), "tests", "e2e", ".auth", "admin.json");

export default async function globalSetup() {
  const baseURL = playwrightBaseURL();
  const dir = path.dirname(storagePath);
  fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login?callbackUrl=${encodeURIComponent("/admin")}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await fillLoginForm(page, CREDS.admin.email, CREDS.admin.password);
    await page.goto(`${baseURL}/admin`, { waitUntil: "domcontentloaded", timeout: 60_000 });

    const pathname = new URL(page.url()).pathname;
    if (pathname === "/login" || pathname.startsWith("/login")) {
      const err = page.getByTestId("login-error");
      const msg = (await err.isVisible().catch(() => false)) ? (await err.innerText().catch(() => "")) : "";
      throw new Error(`[globalSetup] Admin login nije uspio (ostanak na /login). ${msg.trim()}`);
    }

    await context.storageState({ path: storagePath });
  } finally {
    await browser.close();
  }
}
