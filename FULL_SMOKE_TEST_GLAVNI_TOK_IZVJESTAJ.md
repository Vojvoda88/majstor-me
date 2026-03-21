# FULL SMOKE TEST GLAVNOG TOKA — IZVJEŠTAJ

**Datum:** 2026-03-21  
**Projekat:** BrziMajstor.ME (MajstorMe)

---

## 1. Test okruženje

| Stavka | Vrijednost |
|--------|------------|
| **URL** | `http://localhost:3010` |
| **NEXTAUTH_URL** | `http://localhost:3010` (iz `.env`) |
| **Playwright baseURL** | `http://localhost:3010` (`PLAYWRIGHT_BASE_URL` ili default u `playwright.config.ts`) |
| **Test nalozi / seed** | Objava i korisnički dio: `petar@test.me` (`CREDS.smokeRequester`) — izbjegava dnevni limit (5) na `marko@test.me`. Majstor: `majstor.vodoinstalater@test.me`. Lozinka: `Test123!` (ili `E2E_PASSWORD`). Prije E2E: `npx tsx scripts/e2e-marketplace-prep.ts` za kredit majstora. |
| **Origin usklađen** | Da — jedan origin (`localhost:3010`), `NEXTAUTH_URL` i Playwright se podudaraju. |

---

## 2. Rezultat glavnog toka

| Korak | PASS/FAIL |
|-------|-----------|
| USER objava zahtjeva | **PASS** |
| Zahtjev vidljiv majstoru | **PASS** |
| Privatnost prije uzimanja kontakta | **PASS** |
| Uzimanje kontakta | **PASS** |
| Skidanje kredita | **PASS** |
| Tačnost skidanja kredita | **PASS** |
| Zaštita od duplog skidanja | **PASS** |
| Slanje ponude | **PASS** |
| Korisnik vidi ponudu / trag ponude | **PASS** |

*Potvrda: Playwright `tests/e2e/marketplace-flow.spec.ts` (Chromium), jedan puni prolaz (~30s).*

---

## 3. Šta je runtime stvarno potvrđeno

- End-to-end kroz **browser (Playwright)**: prijava korisnika → forma zahtjeva → redirect na `/request/:id` → `clearCookies` → prijava majstora → pregled zahtjeva → **nema** `tel:` linka prije unlock → unlock → krediti → ponuda → ponovna prijava korisnika → dashboard + trag ponude na zahtjevu.
- **Nije** u ovom testu stvarno potvrđeno: push notifikacije na telefon, isporuka emaila, detaljno ponašanje svih edge case-eva.

---

## 4. Tačni problemi koji su nađeni

1. **`waitForURL` sa regexom na cijelom URL-u** — lažno „prolazilo“ na `/login?callbackUrl=.../dashboard/...` jer se `/dashboard/...` pojavljuje u query stringu. **Rješenje:** čekanje po **pathname** (`waitForPathname` u `tests/e2e/helpers/auth.ts`), uključujući `loginAsAdmin`.
2. **Duplikat zahtjeva** — isti opis u 24h za istog korisnika. **Rješenje:** jedinstven sufiks u opisu po runu (`unique`).
3. **Dnevni limit 5 zahtjeva** — `marko@test.me` zagušen u dev-u. **Rješenje:** smoke koristi `petar@test.me` (`smokeRequester`) + `loginAsUser(page, email)`.
4. **POST `/api/offers` odbijen** — zahtjevi sa `adminStatus: PENDING_REVIEW` blokirani starom logikom koja je tražila samo `DISTRIBUTED`. **Rješenje:** ponude blokirati samo za `SPAM` / `DELETED` (`app/api/offers/route.ts`).
5. **Sesija u RSC** — dodat **fallback** u `auth()`: `getToken` + `cookies()` nakon `getServerSession` (`lib/auth/index.ts`).
6. **Fetch** — `credentials: "include"` na unlock i send-offer formama gdje je dodano.

---

## 5. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| `lib/auth/index.ts` | Fallback JWT preko `getToken` + `cookies()` | Pouzdanija sesija u App Routeru |
| `app/api/offers/route.ts` | Blok samo `SPAM`/`DELETED` | `PENDING_REVIEW` zahtjevi mogu dobiti ponudu |
| `components/forms/send-offer-form.tsx` | `credentials: "include"` | Kolačići na POST |
| `components/request/unlock-contact-button.tsx` | `credentials: "include"` | Isto |
| `playwright.config.ts` | Default baseURL `3010` | Usklađenost sa `NEXTAUTH_URL` |
| `tests/e2e/helpers/auth.ts` | `waitForPathname`, `loginAsUser(email?)`, admin pathname | Nema lažnog PASS na login URL-u |
| `tests/e2e/helpers/credentials.ts` | `smokeRequester` (petar) | Limit zahtjeva u dev-u |
| `tests/e2e/marketplace-flow.spec.ts` | Jedinstven opis, pathname wait, petar, ime | Stabilan smoke |

---

## 6. Poslovni zaključak

**GLAVNI MARKETPLACE TOK JE FUNKCIONALAN** — u ovom okruženju, jedan puni Playwright prolaz je prošao end-to-end (objava → majstor → privatnost → unlock → krediti → ponuda → trag za korisnika).

---

## 7. Šta ostaje otvoreno

- **Push / SMS / email** — nisu stvarno verifikovani u E2E; za 100% potvrdu isporuke — ručni test na uređaju / inboxu.
- Ako **`petar@test.me`** takođe dostigne dnevni limit u dev-u: `E2E_SMOKE_REQUESTER_EMAIL` na drugi seed korisnik ili čišćenje starih zahtjeva u bazi.
- **Restart dev servera** na `3010` ako je port držao staru verziju koda prije E2E.

---

*Generisano za stalni format izvještaja (smoke glavni tok).*
