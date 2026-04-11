import { test } from "@playwright/test";
import { dismissPwaInstallModalIfVisible } from "./helpers/auth";
import { assertNoServerComponentError, assertNoErrorPage } from "./helpers/errors";
import { CREDS } from "./helpers/credentials";

async function dismissPwaModalRobust(page: import("@playwright/test").Page) {
  // Prvo pokušaj preko existing helper-a (role-based).
  await dismissPwaInstallModalIfVisible(page).catch(() => {});

  // U produkciji ponekad klik nije “inteligibilan” (overlay), zato force-ujemo.
  const kasnije = page.getByRole("button", { name: /Kasnije/i }).first();
  if (await kasnije.isVisible().catch(() => false)) {
    await kasnije.click({ force: true }).catch(() => {});
  }

  // Sačekaj da se modal “odjavi” (minimum heading).
  const heading = page.getByRole("heading", { name: /Preuzmi aplikaciju/i }).first();
  await heading.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
}

async function fillLoginFormProd(page: import("@playwright/test").Page, email: string, password: string) {
  await dismissPwaModalRobust(page);

  const emailLoc = page.locator('[data-testid="login-email"]');
  const passLoc = page.locator('[data-testid="login-password"]');
  const submitLoc = page.locator('[data-testid="login-submit"]');

  // Na mobilnom profilu PWA modal može prekriti input; zato waitamo samo "attached" (DOM prisutan),
  // ne "visible".
  await emailLoc.waitFor({ state: "attached", timeout: 20_000 });
  await passLoc.waitFor({ state: "attached", timeout: 20_000 });

  await emailLoc.fill(email);
  await passLoc.fill(password);

  await submitLoc.click();
}

async function waitForPathname(page: import("@playwright/test").Page, predicate: (p: string) => boolean, timeout = 25_000) {
  await page.waitForURL(
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

async function loginAsAdminProd(page: import("@playwright/test").Page) {
  await page.goto(`/login?callbackUrl=${encodeURIComponent("/admin")}`, { waitUntil: "domcontentloaded" });
  await fillLoginFormProd(page, CREDS.admin.email, CREDS.admin.password);
  await waitForPathname(
    page,
    (p) =>
      p === "/admin" ||
      p.startsWith("/admin/") ||
      p.startsWith("/dashboard") ||
      p.startsWith("/request"),
    25_000
  );
}

async function loginAsHandymanProd(page: import("@playwright/test").Page) {
  await page.goto("/login?callbackUrl=/dashboard/handyman", { waitUntil: "domcontentloaded" });
  await fillLoginFormProd(page, CREDS.handyman.email, CREDS.handyman.password);
  await waitForPathname(
    page,
    (p) => p === "/dashboard/handyman" || p === "/admin" || p.startsWith("/admin/"),
    25_000
  );
}

test.describe("Faza 5 — Auth mobile UI (screenshot proof)", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("ADMIN: mobile top zatvoren + otvoren (drawer)", async ({ page }, testInfo) => {
    await loginAsAdminProd(page);
    await dismissPwaInstallModalIfVisible(page);
    await page.goto("/admin", { waitUntil: "networkidle" });

    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);

    // Closed state: hamburger prikazuje "Otvori meni", drawer je sakriven (default).
    await page.waitForSelector('button[aria-controls="admin-sidebar-nav"]', { state: "visible" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath("admin-mobile-closed.png"), fullPage: true });

    // Open state: klik na "Otvori meni" → očekujemo overlay i translate-x-0 stanje.
    const openBtn = page.getByRole("button", { name: /Otvori meni/i });
    await openBtn.click();
    const closeOverlayBtn = page.getByRole("button", { name: /Zatvori meni/i }).first();
    await closeOverlayBtn.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});

    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath("admin-mobile-open.png"), fullPage: true });
  });

  test("HANDYMAN: mobile top zatvoren + otvoren (drawer)", async ({ page }, testInfo) => {
    await loginAsHandymanProd(page);
    await dismissPwaInstallModalIfVisible(page);
    await page.goto("/dashboard/handyman", { waitUntil: "networkidle" });

    await assertNoServerComponentError(page);
    await assertNoErrorPage(page);

    // Closed state: drawer nije otvoren (default), prikazuje se hamburger.
    await page.waitForSelector('button[aria-label="Otvori meni"]', { state: "visible" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath("handyman-mobile-closed.png"), fullPage: true });

    // Open state: klik hamburger → drawer se otvara, "Zatvori meni" postaje vidljivo.
    const openBtn = page.getByRole("button", { name: /Otvori meni/i });
    await openBtn.click();
    await page.getByRole("button", { name: /Zatvori meni/i }).first().waitFor({ state: "visible", timeout: 10_000 });

    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath("handyman-mobile-open.png"), fullPage: true });
  });
});

