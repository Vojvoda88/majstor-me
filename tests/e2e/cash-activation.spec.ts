/**
 * Keš aktivacija kredita — smoke (forma + API + success).
 */
import { test, expect } from "@playwright/test";
import { loginAsHandyman } from "./helpers/auth";

const PWA_MODAL_DISMISS_KEY = "pwa-entry-modal-dismissed";

test.describe("Keš aktivacija kredita", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, PWA_MODAL_DISMISS_KEY);
  });

  test("majstor otvara formu, šalje validne podatke, vidi success", async ({ page }) => {
    await loginAsHandyman(page);
    await page.goto("/dashboard/handyman/credits/aktivacija-kes");
    await expect(page.getByRole("heading", { name: /Aktivacija kredita u kešu/i })).toBeVisible();

    const unique = `E2E keš ${Date.now()}`;
    await page.getByLabel(/Ime i prezime/i).fill(unique);
    await page.getByLabel(/^Telefon$/i).fill("067000999");
    await page.getByLabel(/^Grad$/i).fill("Podgorica");
    await page.getByLabel(/^Paket$/i).selectOption({ index: 1 });

    await page.getByRole("button", { name: /Pošalji zahtjev za aktivaciju/i }).click();

    await expect(page.getByText(/Zahtjev je poslat/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: /Nazad na kredite/i })).toBeVisible();
  });
});
