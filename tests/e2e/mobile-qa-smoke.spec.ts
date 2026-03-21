import { test, expect } from "@playwright/test";
import { dismissPwaInstallModalIfVisible, loginAsAdmin, loginAsHandyman } from "./helpers/auth";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";
import { createRequestAndWaitForRedirect } from "./helpers/request";

const PWA_MODAL_DISMISS_KEY = "pwa-entry-modal-dismissed";

/**
 * Vraća koliko px je širina sadržaja veća od viewporta (horizontalni overflow).
 * Dozvoljava 1px zbog zaokruživanja.
 */
async function horizontalOverflowPx(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    const bodyOverflow = body ? body.scrollWidth - body.clientWidth : 0;
    return Math.max(docOverflow, bodyOverflow);
  });
}

test.describe("Mobile QA smoke (390×844)", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, PWA_MODAL_DISMISS_KEY);
  });

  test("homepage / — nema horizontalnog overflowa, ključni blokovi vidljivi", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissPwaInstallModalIfVisible(page);
    await assertNoServerComponentError(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { name: /marketplace|majstor|brzimajstor/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("#kako-radi")).toBeVisible();
  });

  test("/request/create — forma i hitnost bez overflowa", async ({ page }) => {
    await page.goto("/request/create", { waitUntil: "domcontentloaded" });
    await dismissPwaInstallModalIfVisible(page);
    await assertNoServerComponentError(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
    await expect(page.locator("#category")).toBeVisible({ timeout: 15_000 });
  });

  test("/request/[id] — nakon kreiranja zahtjeva, detalj bez overflowa", async ({ page }) => {
    await page.goto("/request/create", { waitUntil: "domcontentloaded" });
    await dismissPwaInstallModalIfVisible(page);
    await assertNoServerComponentError(page);
    await createRequestAndWaitForRedirect(page);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
    await expect(page.getByText(/zahtjev|ponud|kontakt|opis/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("/dashboard/handyman + /credits — handyman dashboard bez overflowa", async ({ page }) => {
    await loginAsHandyman(page);
    await dismissPwaInstallModalIfVisible(page);
    await page.goto("/dashboard/handyman", { waitUntil: "networkidle" });
    await assertNoServerComponentError(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);

    await page.goto("/dashboard/handyman/credits", { waitUntil: "networkidle" });
    await assertNoServerComponentError(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { name: /krediti/i })).toBeVisible({ timeout: 15_000 });
  });

  test("/admin — shell bez overflowa (mobile)", async ({ page }) => {
    await loginAsAdmin(page);
    await dismissPwaInstallModalIfVisible(page);
    await page.goto("/admin", { waitUntil: "networkidle" });
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
  });
});

test.describe("Mobile QA — uža širina 360px", () => {
  test.use({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, PWA_MODAL_DISMISS_KEY);
  });

  test("homepage nema horizontalnog overflowa na 360px", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await dismissPwaInstallModalIfVisible(page);
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
  });
});
