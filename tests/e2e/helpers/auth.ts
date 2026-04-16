import { Page } from "@playwright/test";
import { CREDS } from "./credentials";
import { assertNoServerComponentError } from "./errors";

async function assertNotStuckOnLogin(page: Page, context: string): Promise<void> {
  const pathname = new URL(page.url()).pathname;
  if (pathname !== "/login" && !pathname.startsWith("/login")) return;
  const err = page.getByTestId("login-error");
  const msg = (await err.isVisible().catch(() => false)) ? (await err.innerText().catch(() => "")) : "";
  throw new Error(`${context} — ostali smo na /login. ${msg.trim()}`);
}

/** PWA „Preuzmi aplikaciju“ modal može prekriti formu i pokvariti E2E / klik. */
export async function dismissPwaInstallModalIfVisible(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: /Preuzmi aplikaciju/i });
  const closeButton = page.getByRole("button", { name: /Zatvori/i });
  const kasnije = page.getByRole("button", { name: /Kasnije/i });
  try {
    await dialog.waitFor({ state: "visible", timeout: 2500 });
    if (await kasnije.isVisible().catch(() => false)) {
      await kasnije.click();
    } else if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
    await dialog.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  } catch {
    /* modal nije prikazan */
  }
}

/**
 * Fill login form and submit. Does not wait for redirect; caller should.
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await dismissPwaInstallModalIfVisible(page);
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 15_000 });
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await dismissPwaInstallModalIfVisible(page);
  const credPost = page.waitForResponse(
    (r) =>
      r.url().includes("/api/auth/callback/credentials") && r.request().method() === "POST",
    { timeout: 60_000 }
  );
  await page.getByTestId("login-submit").click();
  await credPost;
}

/**
 * Login as admin. Expects to land on /admin or callbackUrl.
 */
export async function loginAsAdmin(page: Page, callbackUrl = "/admin"): Promise<void> {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, { waitUntil: "domcontentloaded" });
  await dismissPwaInstallModalIfVisible(page);
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 20_000 });
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.admin.email, CREDS.admin.password);
  const target = callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`;
  await page.goto(target, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await assertNotStuckOnLogin(page, "loginAsAdmin");
  await assertNoServerComponentError(page);
}

/**
 * Login as handyman. Expects to land on dashboard or home.
 */
export async function loginAsHandyman(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/handyman");
  await dismissPwaInstallModalIfVisible(page);
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.handyman.email, CREDS.handyman.password);
  await page.goto("/dashboard/handyman", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await assertNotStuckOnLogin(page, "loginAsHandyman");
  await assertNoServerComponentError(page);
}

/**
 * Login as regular user. Expects to land on dashboard or home.
 * `emailOverride` — npr. petar@test.me kada marko@test.me udari dnevni limit zahtjeva u dev-u.
 */
export async function loginAsUser(page: Page, emailOverride?: string): Promise<void> {
  const email = emailOverride ?? CREDS.user.email;
  await page.goto("/login?callbackUrl=/dashboard/user", { waitUntil: "domcontentloaded" });
  await dismissPwaInstallModalIfVisible(page);
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 20_000 });
  await assertNoServerComponentError(page);
  await fillLoginForm(page, email, CREDS.user.password);
  await page.goto("/dashboard/user", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await assertNotStuckOnLogin(page, "loginAsUser");
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
