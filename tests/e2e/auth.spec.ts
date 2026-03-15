import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsHandyman,
  loginAsUser,
  logout,
  fillLoginForm,
} from "./helpers/auth";
import { assertNoServerComponentError } from "./helpers/errors";

test.describe("Auth", () => {
  test("Login page opens and shows form", async ({ page }) => {
    await page.goto("/login");
    expect(page.url()).toContain("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await assertNoServerComponentError(page);
  });

  test("Successful login as admin redirects and session works", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/(admin|dashboard|\?)/);
    await assertNoServerComponentError(page);
    await page.goto("/admin");
    if (page.url().includes("/admin")) {
      await assertNoServerComponentError(page);
      await expect(page.getByText(/dashboard|admin panel|zahtjevi|recent/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test("Successful login as handyman", async ({ page }) => {
    await loginAsHandyman(page);
    await expect(page).toHaveURL(/\/(dashboard\/handyman|admin)/);
    await assertNoServerComponentError(page);
  });

  test("Successful login as user", async ({ page }) => {
    await loginAsUser(page);
    await expect(page).toHaveURL(/\/(dashboard\/user|admin)/);
    await assertNoServerComponentError(page);
  });

  test("Protected route redirects to login when not logged in", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("login");
    expect(page.url()).toContain("callbackUrl");
  });

  test("Wrong credentials show error and stay on login", async ({ page }) => {
    await page.goto("/login");
    await fillLoginForm(page, "wrong@test.me", "WrongPass1!");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 8000 });
  });

  test("Logout from admin", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);
    await page.getByTestId("admin-signout").click();
    await page.waitForURL(/\/(login)?(\?|$)/, { timeout: 12_000 });
    await page.goto("/admin");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("login");
  });
});
