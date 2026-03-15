import { test, expect } from "@playwright/test";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Public routes", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("GET / – homepage loads and shows content", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
    await expect(page.getByTestId("public-header")).toBeVisible();
    await expect(page.getByTestId("nav-prijava")).toBeVisible();
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
    await expect(page.getByTestId("login-form")).toBeVisible({ timeout: 15_000 });
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
    await page.getByTestId("nav-prijava").scrollIntoViewIfNeeded();
    await page.getByTestId("nav-prijava").click();
    await expect(page).toHaveURL(/\/login/);
    await assertNoServerComponentError(page);
  });

  test("Click Registruj se kao majstor goes to /register", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.getByTestId("nav-registracija-majstor").scrollIntoViewIfNeeded();
    await page.getByTestId("nav-registracija-majstor").click();
    await expect(page).toHaveURL(/\/register/);
    await assertNoServerComponentError(page);
  });

  test("Header links: Početna, Kategorije", async ({ page }) => {
    await page.goto("/");
    await assertNoServerComponentError(page);
    await page.getByTestId("nav-pocetna").click();
    await expect(page).toHaveURL(/\//);
    await page.getByTestId("nav-kategorije").click();
    await expect(page).toHaveURL(/\/categories/);
    await assertNoServerComponentError(page);
  });
});
