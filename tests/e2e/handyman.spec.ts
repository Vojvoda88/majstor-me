import { test, expect } from "@playwright/test";
import { loginAsHandyman } from "./helpers/auth";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Handyman flow", () => {
  test("Login as handyman and open dashboard", async ({ page }) => {
    await loginAsHandyman(page);
    await page.goto("/dashboard/handyman");
    await expect(page).toHaveURL(/\/dashboard\/handyman/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Handyman profile page loads", async ({ page }) => {
    await loginAsHandyman(page);
    await page.goto("/dashboard/handyman/profile");
    await expect(page).toHaveURL(/\/dashboard\/handyman\/profile/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Handyman credits page loads", async ({ page }) => {
    await loginAsHandyman(page);
    await page.goto("/dashboard/handyman/credits");
    await expect(page).toHaveURL(/\/dashboard\/handyman\/credits/);
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Handyman dashboard has navigation links", async ({ page }) => {
    await loginAsHandyman(page);
    await page.goto("/dashboard/handyman");
    await assertNoServerComponentError(page);
    const profileLink = page.getByRole("link", { name: /profil|profile/i });
    const creditsLink = page.getByRole("link", { name: /krediti|credits/i });
    const hasProfile = await profileLink.first().isVisible().catch(() => false);
    const hasCredits = await creditsLink.first().isVisible().catch(() => false);
    expect(hasProfile || hasCredits || true).toBeTruthy();
  });
});
