import { test, expect } from "@playwright/test";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Admin flow", () => {
  test("Admin dashboard loads without server component error", async ({ page }) => {
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/admin/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Admin requests page loads", async ({ page }) => {
    await page.goto("/admin/requests");
    await expect(page).toHaveURL(/\/admin\/requests/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Admin users page loads", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Admin handymen page loads", async ({ page }) => {
    await page.goto("/admin/handymen");
    await expect(page).toHaveURL(/\/admin\/handymen/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Admin moderation page loads", async ({ page }) => {
    await page.goto("/admin/moderation");
    await expect(page).toHaveURL(/\/admin\/moderation/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Admin sidebar navigation works", async ({ page }) => {
    await page.goto("/admin");
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
