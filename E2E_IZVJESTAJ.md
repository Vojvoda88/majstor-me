# E2E Test Suite – Završni izvještaj

## 1. Testovi

| Spec | Opis |
|------|------|
| **public.spec.ts** | Homepage, /categories, /login, /register, /request/create – učitavanje i osnovni sadržaj; klik na Prijava → /login; Postani majstor → /register; header linkovi (Početna, Kategorije). |
| **auth.spec.ts** | Otvaranje login stranice; uspješan login (admin, handyman, user); redirect na login kada nisi prijavljen; pogrešni kredencijali (poruka greške); logout iz admina. |
| **request.spec.ts** | Otvaranje /request/create i vidljivost forme; popuna forme i submit → redirect na /request/[id]; učitavanje request detail stranice; submit bez obaveznih polja → validacija. |
| **handyman.spec.ts** | Login kao handyman; /dashboard/handyman, /dashboard/handyman/profile, /dashboard/handyman/credits; navigacioni linkovi. |
| **admin.spec.ts** | Login kao admin; /admin (dashboard); /admin/requests, /admin/users, /admin/handymen, /admin/moderation; sidebar navigacija (Dashboard, Zahtjevi, Korisnici, Majstori). |
| **smoke-clicks.spec.ts** | PublicHeader (Početna, Kategorije, Postani majstor, Prijava); hero ili kategorija CTA; sticky / request create CTA; admin sidebar (Dashboard, Zahtjevi, Korisnici, Majstori). |

## 2. Rute i flowovi

- **Javne:** `/`, `/categories`, `/login`, `/register`, `/request/create`
- **Auth:** login (credentials), redirect na callbackUrl, zaštićene rute, logout (POST signout)
- **Request:** kreiranje zahtjeva (forma bez slika), redirect na `/request/[id]`, request detail
- **Handyman:** `/dashboard/handyman`, `/dashboard/handyman/profile`, `/dashboard/handyman/credits`
- **Admin:** `/admin`, `/admin/requests`, `/admin/users`, `/admin/handymen`, `/admin/moderation`, sidebar linkovi

## 3. Pokretanje

```bash
# 1. Seed (jednom)
npm run db:seed

# 2. Dev server (u drugom terminalu)
npm run dev

# 3. E2E
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

Samo Chromium: `npx playwright test --project=chromium`

## 4. Env / seed podaci

- **Seed:** `npm run db:seed` – kreira admin, user, handyman (lozinka **Test123!**).
- **Env (opciono):**  
  `E2E_ADMIN_EMAIL`, `E2E_USER_EMAIL`, `E2E_HANDYMAN_EMAIL`, `E2E_PASSWORD`  
  ili `ADMIN_EMAIL`, `ADMIN_PASSWORD` za admin.
- **BaseURL:** `http://localhost:3000` (ili `PLAYWRIGHT_BASE_URL`).

## 5. Otkriveni problemi

- **Preširoka provjera "500":** U body-ju se pojavio običan broj "500" (npr. u statistikama), što je dovodilo do lažnih padova. U `helpers/errors.ts` uklonjen je samo "500", dodan je "500 Internal" da se hvata stvarna 500 stranica.
- **Selektori za header linkove:** Na početnoj stranici `getByRole('link', { name: /prijava/i })` je mogao biti spor ili višeznačan. Zamijenjeno je s `locator('header a[href="/login"]')` (i analogno za ostale linkove) radi stabilnijeg klika.

## 6. Dodani fajlovi

| Fajl | Namjena |
|------|--------|
| `playwright.config.ts` | Config: baseURL, headless, screenshot/trace on failure, Chromium + Firefox. |
| `tests/e2e/helpers/credentials.ts` | Admin/user/handyman email i lozinka (env/seed). |
| `tests/e2e/helpers/errors.ts` | assertNoErrorPage, assertNoServerComponentError, assertNot500, assertNoGenericErrorScreen. |
| `tests/e2e/helpers/auth.ts` | fillLoginForm, loginAsAdmin, loginAsHandyman, loginAsUser, logout. |
| `tests/e2e/helpers/navigation.ts` | openAdminSafely, expectPageOk. |
| `tests/e2e/helpers/request.ts` | fillCreateRequestForm, submitCreateRequestForm, createRequestAndWaitForRedirect. |
| `tests/e2e/public.spec.ts` | Javne rute i CTA klikovi. |
| `tests/e2e/auth.spec.ts` | Auth flowovi. |
| `tests/e2e/request.spec.ts` | Request create i detail. |
| `tests/e2e/handyman.spec.ts` | Handyman dashboard flow. |
| `tests/e2e/admin.spec.ts` | Admin stranice i sidebar. |
| `tests/e2e/smoke-clicks.spec.ts` | Smoke klikovi. |
| `tests/e2e/README.md` | Uputstvo za E2E. |

## 7. NPM skripte

U `package.json` dodano:

- **test:e2e** – `playwright test` (headless)
- **test:e2e:ui** – `playwright test --ui`
- **test:e2e:headed** – `playwright test --headed`

## Rezime

Implementiran je puni Playwright E2E set sa TypeScriptom: helperi za auth, error provjere, request formu i navigaciju; testovi za javne rute, auth, request, handyman i admin flow; smoke test za glavne klikove. Testovi ovise o seed podacima i lokalnom dev serveru; error guard je prilagođen da ne pada na običan broj "500" u sadržaju.
