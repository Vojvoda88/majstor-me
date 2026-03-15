import { Page } from "@playwright/test";
import { CREDS } from "./credentials";
import { assertNoServerComponentError } from "./errors";

/**
 * Fill login form and submit. Does not wait for redirect; caller should.
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/lozinka|password/i).fill(password);
  await page.getByRole("button", { name: /prijavi se|login/i }).click();
}

/**
 * Login as admin. Expects to land on /admin or callbackUrl.
 */
export async function loginAsAdmin(page: Page, callbackUrl = "/admin"): Promise<void> {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.admin.email, CREDS.admin.password);
  await page.waitForURL(/\/(admin|dashboard|request|login)\b|\/\?/, { timeout: 20_000 });
  await assertNoServerComponentError(page);
}

/**
 * Login as handyman. Expects to land on dashboard or home.
 */
export async function loginAsHandyman(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/handyman");
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.handyman.email, CREDS.handyman.password);
  await page.waitForURL(/\/(dashboard\/handyman|admin)|^\/$/, { timeout: 15_000 });
  await assertNoServerComponentError(page);
}

/**
 * Login as regular user. Expects to land on dashboard or home.
 */
export async function loginAsUser(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/user");
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.user.email, CREDS.user.password);
  await page.waitForURL(/\/(dashboard\/user|admin)|^\/$/, { timeout: 15_000 });
  await assertNoServerComponentError(page);
}

/**
 * Logout: go to a page that has signout and submit, or call signOut API.
 * Admin layout has "Odjavi se" form POST /api/auth/signout.
 */
export async function logout(page: Page): Promise<void> {
  await page.goto("/admin").catch(() => page.goto("/"));
  const form = page.locator('form[action*="signout"]').first();
  if (await form.isVisible()) {
    await form.submit();
    await page.waitForURL(/\/(login)?(\?|$)/, { timeout: 10_000 }).catch(() => {});
  } else {
    await page.goto("/api/auth/signout");
    await page.click('text=Odjavi se').catch(() => {});
  }
}
