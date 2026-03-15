import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Smoke – main clicks", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("PublicHeader: Početna, Kategorije, Postani majstor, Prijava", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.getByTestId("nav-pocetna").click();
    await expect(page).toHaveURL(/\//);
    await assertNoServerComponentError(page);
    await page.getByTestId("nav-kategorije").click();
    await expect(page).toHaveURL(/\/categories/);
    await assertNoServerComponentError(page);
    await page.getByTestId("nav-postani-majstor").click();
    await expect(page).toHaveURL(/\/register/);
    await page.getByTestId("nav-prijava").click();
    await expect(page).toHaveURL(/\/login/);
    await assertNoServerComponentError(page);
  });

  test("Sticky CTA goes to request create on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await assertNoServerComponentError(page);
    const cta = page.getByTestId("sticky-cta");
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/request\/create/);
    await assertNoServerComponentError(page);
  });

  test("Admin sidebar: Dashboard, Zahtjevi, Korisnici, Majstori", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await assertNoServerComponentError(page);
    await page.getByTestId("admin-nav-dashboard").click();
    await expect(page).toHaveURL(/\/admin\/?$/);
    await assertNoServerComponentError(page);
    await page.getByTestId("admin-nav-requests").click();
    await expect(page).toHaveURL(/\/admin\/requests/);
    await page.getByTestId("admin-nav-users").click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await page.getByTestId("admin-nav-handymen").click();
    await expect(page).toHaveURL(/\/admin\/handymen/);
    await assertNoServerComponentError(page);
  });
});
