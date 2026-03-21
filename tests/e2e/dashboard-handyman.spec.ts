import { test, expect } from "@playwright/test";
import { loginAsHandyman } from "./helpers/auth";
import { assertNoServerComponentError } from "./helpers/errors";

const PWA_MODAL_DISMISS_KEY = "pwa-entry-modal-dismissed";

test.describe("Handyman dashboard / profil (chunk smoke)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, PWA_MODAL_DISMISS_KEY);
  });

  test("dashboard i profil učitaju bez ChunkLoadError", async ({ page }) => {
    const fatal: string[] = [];
    page.on("pageerror", (err) => {
      fatal.push(err.message);
    });

    await loginAsHandyman(page);
    await assertNoServerComponentError(page);
    await expect(page).toHaveURL(/\/dashboard\/handyman/);

    await page.goto("/dashboard/handyman/profile");
    await page.waitForLoadState("domcontentloaded");
    await assertNoServerComponentError(page);
    await expect(page).toHaveURL(/\/dashboard\/handyman\/profile/);

    const body = await page.content();
    expect(body.length).toBeGreaterThan(100);

    const chunkRelated = fatal.filter(
      (m) =>
        /ChunkLoadError|Loading chunk|chunk.*failed|Failed to fetch dynamically imported module/i.test(m)
    );
    expect(chunkRelated, chunkRelated.join(" | ")).toEqual([]);
  });
});
