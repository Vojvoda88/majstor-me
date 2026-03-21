import { Page } from "@playwright/test";
import { CREDS } from "./credentials";
import { assertNoServerComponentError } from "./errors";

/** waitForURL sa regexom na cijelom URL-u lažno „prođe“ na /login?callbackUrl=/dashboard/... — provjerava pathname. */
function waitForPathname(
  page: Page,
  predicate: (pathname: string) => boolean,
  timeout = 25_000
): Promise<void> {
  return page.waitForURL(
    (url) => {
      try {
        return predicate(new URL(url).pathname);
      } catch {
        return false;
      }
    },
    { timeout }
  );
}

/** PWA „Preuzmi aplikaciju“ modal može prekriti formu i pokvariti E2E / klik. */
export async function dismissPwaInstallModalIfVisible(page: Page): Promise<void> {
  const kasnije = page.getByRole("button", { name: /Kasnije/i });
  try {
    await kasnije.waitFor({ state: "visible", timeout: 2500 });
    await kasnije.click();
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
  await waitForPathname(
    page,
    (p) =>
      p === "/admin" ||
      p.startsWith("/admin/") ||
      p.startsWith("/dashboard") ||
      p.startsWith("/request"),
    25_000
  );
  await assertNoServerComponentError(page);
}

/**
 * Login as handyman. Expects to land on dashboard or home.
 */
export async function loginAsHandyman(page: Page): Promise<void> {
  await page.goto("/login?callbackUrl=/dashboard/handyman");
  await assertNoServerComponentError(page);
  await fillLoginForm(page, CREDS.handyman.email, CREDS.handyman.password);
  await waitForPathname(
    page,
    (p) => p === "/dashboard/handyman" || p === "/admin" || p.startsWith("/admin/"),
    25_000
  );
  await assertNoServerComponentError(page);
}

/**
 * Login as regular user. Expects to land on dashboard or home.
 * `emailOverride` — npr. petar@test.me kada marko@test.me udari dnevni limit zahtjeva u dev-u.
 */
export async function loginAsUser(page: Page, emailOverride?: string): Promise<void> {
  const email = emailOverride ?? CREDS.user.email;
  await page.goto("/login?callbackUrl=/dashboard/user", { waitUntil: "domcontentloaded" });
  await page.getByTestId("login-email").waitFor({ state: "visible", timeout: 20_000 });
  await assertNoServerComponentError(page);
  await fillLoginForm(page, email, CREDS.user.password);
  await waitForPathname(
    page,
    (p) => p === "/dashboard/user" || p === "/admin" || p.startsWith("/admin/"),
    25_000
  );
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
