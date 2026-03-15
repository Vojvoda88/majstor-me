import { Page } from "@playwright/test";
import { assertNoServerComponentError, assertNoErrorPage } from "./errors";

/**
 * Open /admin only if already logged in as admin; otherwise would redirect to login.
 * Use after loginAsAdmin().
 */
export async function openAdminSafely(page: Page): Promise<void> {
  const res = await page.goto("/admin");
  if (res && res.status() === 500) {
    throw new Error("Admin page returned 500");
  }
  await page.waitForLoadState("domcontentloaded");
  const url = page.url();
  if (url.includes("/login")) return;
  await assertNoServerComponentError(page);
  await assertNoErrorPage(page);
}

/**
 * Assert current page has no runtime/error content.
 */
export async function expectPageOk(page: Page): Promise<void> {
  await assertNoServerComponentError(page);
  await assertNoErrorPage(page);
}
