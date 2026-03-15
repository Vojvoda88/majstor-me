import { test, expect } from "@playwright/test";
import {
  fillCreateRequestForm,
  submitCreateRequestForm,
  createRequestAndWaitForRedirect,
} from "./helpers/request";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";

test.describe("Request flow", () => {
  test("Open /request/create and form is visible", async ({ page }) => {
    await page.goto("/request/create");
    expect(await page.getByText(/novi zahtjev/i).first().isVisible()).toBeTruthy();
    await expect(page.locator("#category")).toBeVisible();
    await expect(page.locator("#requesterName")).toBeVisible();
    await assertNoServerComponentError(page);
  });

  test("Fill form and submit – redirects to /request/[id]", async ({ page }) => {
    await page.goto("/request/create");
    await assertNoServerComponentError(page);
    const id = await createRequestAndWaitForRedirect(page);
    expect(id).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(`/request/${id}`));
    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);
  });

  test("Request detail page loads after create", async ({ page }) => {
    await page.goto("/request/create");
    await createRequestAndWaitForRedirect(page);
    await assertNoServerComponentError(page);
    await expect(
      page.getByText(/zahtjev|ponude|detalj|opis/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Submit without required fields shows validation", async ({ page }) => {
    await page.goto("/request/create");
    await page.getByTestId("create-request-submit").first().click();
    await expect(page).toHaveURL(/\/request\/create/);
    await expect(
      page.getByText(/unesite|obavezno|minimalno|odaberite/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
