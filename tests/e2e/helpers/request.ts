import { Page } from "@playwright/test";

/** Minimal valid request form data (no photos). */
export async function fillCreateRequestForm(page: Page, overrides?: Partial<{
  requesterName: string;
  requesterPhone: string;
  category: string;
  title: string;
  description: string;
  city: string;
}>): Promise<void> {
  const name = overrides?.requesterName ?? "E2E Test Korisnik";
  const phone = overrides?.requesterPhone ?? "+38269123456";
  const category = overrides?.category ?? "Vodoinstalater";
  const title = overrides?.title ?? "E2E test zahtjev";
  const description = overrides?.description ?? "Opis za E2E test. Minimalno 10 karaktera.";
  const city = overrides?.city ?? "Nikšić";

  await page.locator("#requesterName").fill(name);
  await page.locator("#requesterPhone").fill(phone);
  await page.locator("#category").selectOption({ label: category });
  await page.locator("#title").fill(title);
  await page.locator("#description").fill(description);
  await page.locator("#city").selectOption({ label: city });
}

/**
 * Submit create-request form (desktop or mobile submit button).
 */
export async function submitCreateRequestForm(page: Page): Promise<void> {
  const buttons = page.getByTestId("create-request-submit");
  const n = await buttons.count();
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i);
    if (await b.isVisible()) {
      await b.click();
      return;
    }
  }
  throw new Error("Nema vidljivog create-request-submit gumba (mobile sticky vs desktop).");
}

/**
 * Full flow: fill minimal request form and submit. Waits for API response then redirect.
 */
export async function createRequestAndWaitForRedirect(page: Page): Promise<string> {
  await fillCreateRequestForm(page);
  await submitCreateRequestForm(page);
  /** Slanje ide kroz server action (createRequestAction), ne nužno POST /api/requests. */
  await page.waitForURL(/\/request\/[^/]+/, { timeout: 25_000 });
  const url = page.url();
  const match = url.match(/\/request\/([^/?#]+)/);
  if (!match) throw new Error("Expected redirect to /request/[id], got " + url);
  return match[1];
}
