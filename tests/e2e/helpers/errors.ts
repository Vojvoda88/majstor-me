import { Page, expect } from "@playwright/test";

const BAD_TEXTS = [
  "An error occurred in the Server Components render",
  "Došlo je do greške",
  "Application error",
  "Internal Server Error",
  "500 Internal",
] as const;

/**
 * Fail if page body contains any known error message.
 */
export async function assertNoErrorPage(page: Page): Promise<void> {
  const body = await page.content();
  for (const bad of BAD_TEXTS) {
    if (body.includes(bad)) {
      throw new Error(`Page contains error text: "${bad}"`);
    }
  }
}

/**
 * Assert no Server Components error (most common crash).
 */
export async function assertNoServerComponentError(page: Page): Promise<void> {
  const body = await page.content();
  if (body.includes("An error occurred in the Server Components render")) {
    throw new Error("Page shows Server Components render error");
  }
}

/**
 * Assert response was not 500 (use after navigation).
 */
export function assertNot500(response: { status: number } | null): void {
  if (response && response.status === 500) {
    throw new Error(`Request returned 500`);
  }
}

/**
 * Assert page does not show generic error screen.
 */
export async function assertNoGenericErrorScreen(page: Page): Promise<void> {
  await assertNoErrorPage(page);
}
