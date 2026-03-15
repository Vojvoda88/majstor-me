import { test, expect } from "@playwright/test";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Public routes", () => {
  test("GET / – homepage loads and shows content", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByRole("link", { name: /prijava/i })).toBeVisible();
    await expect(page.getByText(/majstor|početna|kategorije/i).first()).toBeVisible();
  });

  test("GET /categories – categories page loads", async ({ page }) => {
    const res = await page.goto("/categories");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByRole("heading", { name: /sve kategorije|kategorije/i }).first()).toBeVisible();
  });

  test("GET /login – login page loads", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/lozinka|password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /prijavi se/i })).toBeVisible();
  });

  test("GET /register – register page loads", async ({ page }) => {
    const res = await page.goto("/register");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByText(/registracija|registrujte/i).first()).toBeVisible();
  });

  test("GET /request/create – create request page loads", async ({ page }) => {
    const res = await page.goto("/request/create");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByText(/novi zahtjev/i).first()).toBeVisible();
  });

  test("Click Prijava on homepage goes to /login", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.locator('header a[href="/login"]').first().click();
    await expect(page).toHaveURL(/\/login/);
    await assertNoServerComponentError(page);
  });

  test("Click Postani majstor goes to /register", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.locator('header a[href="/register"]').first().click();
    await expect(page).toHaveURL(/\/register/);
    await assertNoServerComponentError(page);
  });

  test("Header links: Početna, Kategorije, Kako radi", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.locator('header a[href="/"]').first().click();
    await expect(page).toHaveURL(/\//);
    await page.locator('header a[href="/categories"]').first().click();
    await expect(page).toHaveURL(/\/categories/);
    await assertNoServerComponentError(page);
  });
});
