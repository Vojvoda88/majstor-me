import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Smoke – main clicks", () => {
  test("PublicHeader: Početna, Kategorije, Postani majstor, Prijava", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.getByRole("link", { name: /početna/i }).first().click();
    await expect(page).toHaveURL(/\//);
    await assertNoServerComponentError(page);
    await page.getByRole("link", { name: /kategorije/i }).first().click();
    await expect(page).toHaveURL(/\/categories/);
    await assertNoServerComponentError(page);
    await page.getByRole("link", { name: /postani majstor/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
    await page.getByRole("link", { name: /prijava/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await assertNoServerComponentError(page);
  });

  test("Hero CTA or category link on homepage", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    const regLink = page.getByRole("link", { name: /postani majstor|registracija/i }).first();
    const catLink = page.getByRole("link", { name: /vodoinstalater|električar|kategorij/i }).first();
    if (await regLink.isVisible()) {
      await regLink.click();
      await expect(page).toHaveURL(/\/register/);
    } else if (await catLink.isVisible()) {
      await catLink.click();
      await expect(page).toHaveURL(/\/(category|categories)/);
    }
    await assertNoServerComponentError(page);
  });

  test("Sticky / request create CTA", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    const cta = page.getByRole("link", { name: /zahtjev|novi zahtjev|pošalji/i }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await expect(page).toHaveURL(/\/request\/create/);
      await assertNoServerComponentError(page);
    }
  });

  test("Admin sidebar: Dashboard, Zahtjevi, Korisnici, Majstori", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await assertNoServerComponentError(page);
    await page.locator('aside a[href="/admin"]').first().click();
    await expect(page).toHaveURL(/\/admin\/?$/);
    await assertNoServerComponentError(page);
    await page.locator('aside a[href="/admin/requests"]').first().click();
    await expect(page).toHaveURL(/\/admin\/requests/);
    await page.locator('aside a[href="/admin/users"]').first().click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await page.locator('aside a[href="/admin/handymen"]').first().click();
    await expect(page).toHaveURL(/\/admin\/handymen/);
    await assertNoServerComponentError(page);
  });
});
