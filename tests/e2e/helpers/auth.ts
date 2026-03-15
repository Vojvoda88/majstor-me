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
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 15_000 });
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
}

/**
 * Login as admin. Expects to land on /admin or callbackUrl.
 */
export async function loginAsAdmin(page: Page, callbackUrl = "/admin"): Promise<void> {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 20_000 });
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.admin.email, CREDS.admin.password);
  await page.waitForURL(/\/(admin|dashboard|request)\b/, { timeout: 25_000 });
  await assertNoServerComponentError(page);
}

/**
 * Login as handyman. Expects to land on dashboard or home.
 */
export async function loginAsHandyman(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/handyman");
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.handyman.email, CREDS.handyman.password);
  await page.waitForURL(/\/(dashboard\/handyman|admin)\b/, { timeout: 25_000 });
  await assertNoServerComponentError(page);
}

/**
 * Login as regular user. Expects to land on dashboard or home.
 */
export async function loginAsUser(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/user", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 20_000 });
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.user.email, CREDS.user.password);
  await page.waitForURL(/\/(dashboard\/user|admin)\b/, { timeout: 25_000 });
  await assertNoServerComponentError(page);
}

/**
 * Logout: submit signout form by clicking its submit button (Locator has no .submit()).
 */
export async function logout(page: Page): Promise<void> {
  await page.goto("/admin").catch(() => page.goto("/"));
  const form = page.locator('form[action*="signout"]').first();
  if (await form.isVisible()) {
    const submitBtn = form.locator("button[type=\"submit\"], input[type=\"submit\"]").first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    } else {
      await form.evaluate((el: HTMLFormElement) => el.submit());
    }
    await page.waitForURL(/\/(login)?(\?|$)/, { timeout: 10_000 }).catch(() => {});
  }
}
