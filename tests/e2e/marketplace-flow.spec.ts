import { test, expect } from "@playwright/test";
import { loginAsHandyman, loginAsUser } from "./helpers/auth";
import { CREDS } from "./helpers/credentials";
import { fillCreateRequestForm, submitCreateRequestForm } from "./helpers/request";
import { assertNoServerComponentError } from "./helpers/errors";

const PWA_MODAL_DISMISS_KEY = "pwa-entry-modal-dismissed";

/** Telefon iz forme — ne smije biti vidljiv kao tel: link prije unlock-a */
const HIDDEN_USER_PHONE = "+38269123456";

const gotoOpts = { waitUntil: "domcontentloaded" as const, timeout: 60_000 };

test.describe("Marketplace glavni tok (smoke)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, PWA_MODAL_DISMISS_KEY);
  });

  test("objava → majstor vidi → privatnost → unlock → krediti → ponuda → korisnik vidi trag", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    // Jedinstveno po runu (duplicate check na opis u 24h; limit 5/dan po korisniku u dev ponavljanjima)
    const unique = `SMOKE-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const title = `Curenje slavine — ${unique}`;
    // Duplikat u create-request-shared: isti user + isti opis u 24h → mora biti jedinstven po runu
    const description =
      `Potrebna intervencija u kuhinji, curenje ispod sudopere. Opis za smoke test (${unique}), dovoljno detalja za kategoriju.`;

    await loginAsUser(page, CREDS.smokeRequester.email);
    await page.goto("/request/create");
    await assertNoServerComponentError(page);
    await fillCreateRequestForm(page, {
      title,
      description,
      category: "Vodoinstalater",
      city: "Nikšić",
      requesterName: "Marko Marković",
      requesterPhone: HIDDEN_USER_PHONE,
    });
    await submitCreateRequestForm(page);
    // Samo stvarni pathname /request/:id (ne query callbackUrl=/request/...)
    await page.waitForURL(
      (url) => {
        try {
          const p = new URL(url).pathname;
          const seg = p.split("/").filter(Boolean);
          return seg.length === 2 && seg[0] === "request" && seg[1] !== "create";
        } catch {
          return false;
        }
      },
      { timeout: 20_000 }
    );
    // Prijavljen korisnik bi trebao imati zahtjev bez guest tokena u URL-u (zavisi od session cookie na POST)
    const m = page.url().match(/\/request\/(?!create)([^/?#]+)/);
    expect(m).toBeTruthy();
    const requestId = m![1];

    // Pouzdana promjena uloge u E2E (header Odjava ovisi o useSession; ne blokirati tok na tome)
    await page.context().clearCookies();
    await page.waitForTimeout(300);

    await loginAsHandyman(page);
    await page.goto(`/request/${requestId}`, gotoOpts);
    await assertNoServerComponentError(page);
    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 15_000 });
    expect(await page.locator(`a[href^="tel:"]`).count()).toBe(0);

    let creditsBefore: number | null = null;
    await page.goto("/dashboard/handyman", gotoOpts);
    await assertNoServerComponentError(page);
    const creditsEl = page.locator("#credits");
    if (await creditsEl.isVisible().catch(() => false)) {
      const t = (await creditsEl.textContent()) ?? "";
      const n = t.match(/(\d+)/);
      creditsBefore = n ? parseInt(n[1], 10) : null;
    }

    await page.goto(`/request/${requestId}`, gotoOpts);
    const unlockBtn = page.getByRole("button", { name: /Uzmi kontakt/i });
    await expect(unlockBtn).toBeVisible({ timeout: 15_000 });

    const unlockRespP = page.waitForResponse(
      (r) =>
        r.url().includes(`/api/requests/${requestId}/unlock-contact`) && r.request().method() === "POST",
      { timeout: 25_000 }
    );
    await unlockBtn.click();
    const unlockRes = await unlockRespP;
    expect(unlockRes.ok()).toBeTruthy();
    const unlockJson = (await unlockRes.json()) as {
      success?: boolean;
      data?: { creditsSpent?: number; alreadyUnlocked?: boolean };
    };
    expect(unlockJson.success).toBeTruthy();
    const spentFirst = unlockJson.data?.creditsSpent ?? 0;

    await expect(page.getByText(/Kontakt je dostupan/i)).toBeVisible({ timeout: 15_000 });
    expect(await page.locator(`a[href^="tel:"]`).count()).toBeGreaterThan(0);

    const dup = await page.request.post(`/api/requests/${requestId}/unlock-contact`);
    const dupJson = (await dup.json()) as { success?: boolean; data?: { alreadyUnlocked?: boolean } };
    expect(dupJson.success).toBeTruthy();
    expect(dupJson.data?.alreadyUnlocked).toBe(true);

    await expect(page.getByRole("heading", { name: /Pošalji ponudu/i })).toBeVisible({ timeout: 20_000 });
    await page.getByLabel(/Poruka/i).fill(`Ponuda za ${unique}: dolazim sutra ujutro.`);
    const offerP = page.waitForResponse(
      (r) => r.url().includes("/api/offers") && r.request().method() === "POST",
      { timeout: 25_000 }
    );
    await page.getByRole("button", { name: /Pošalji ponudu/i }).click();
    const offerRes = await offerP;
    expect(offerRes.ok()).toBeTruthy();

    await page.context().clearCookies();
    await page.waitForTimeout(300);

    await loginAsUser(page, CREDS.smokeRequester.email);
    await page.goto("/dashboard/user", gotoOpts);
    await assertNoServerComponentError(page);
    await expect(page.getByText(/\d+\s+ponuda/i).first()).toBeVisible({ timeout: 15_000 });
    await page.goto(`/request/${requestId}`, gotoOpts);
    await expect(page.getByText(/Ponude \(\d+\)/i)).toBeVisible({ timeout: 15_000 });

    if (creditsBefore != null && spentFirst > 0) {
      await page.goto("/dashboard/handyman", gotoOpts);
      const creditsEl2 = page.locator("#credits");
      if (await creditsEl2.isVisible().catch(() => false)) {
        const t2 = (await creditsEl2.textContent()) ?? "";
        const n2 = t2.match(/(\d+)/);
        const creditsAfter = n2 ? parseInt(n2[1], 10) : null;
        if (creditsAfter != null) {
          expect(creditsBefore - creditsAfter).toBe(spentFirst);
        }
      }
    }
  });
});
