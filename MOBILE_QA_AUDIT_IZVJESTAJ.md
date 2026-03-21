# MOBILE QA AUDIT — IZVJEŠTAJ

## 1. Testirano okruženje

| Stavka | Detalj |
|--------|--------|
| **Viewport (glavni)** | **390×844** — Playwright projekt `mobile` (`playwright.config.ts`) + `test.use` u `mobile-qa-smoke.spec.ts` |
| **Uži test** | **360×800** — poseban `describe` u `mobile-qa-smoke.spec.ts` (samo homepage overflow) |
| **Base URL** | `http://localhost:3010` (isti kao `npm run dev` / `PLAYWRIGHT_BASE_URL`) |
| **Runtime provjera** | Playwright: `tests/e2e/mobile-qa-smoke.spec.ts` (overflow `scrollWidth - clientWidth ≤ 1`), navigacija, ključni tekstovi; `tests/e2e/request.spec.ts` na `--project=mobile` nakon popravki helpera |
| **Šta nije „pravi telefon“** | Nema fizičkog iOS/Android uređaja u ovom prolazu — ponašanje tastature i Safari/Chrome razlike su **procjena / otvoreno** |

---

## 2. Rezultat po rutama

### `/` — **PASS**
- **Valja:** Nema horizontalnog overflowa na 390×844 i 360px širine; sekcija `#kako-radi` vidljiva; `overflow-x-hidden` na `<main>` + postojeći `body` overflow.
- **Ne valja / rizik:** Dinamički sadržaj (recenzije) može na sporom mrežnom učitavanju kasnije promijeniti širinu — nije detektovano u ovom smoke prolazu.

### `/request/create` — **PASS**
- **Valja:** Forma i hitnost učitani; overflow ≤ 1px; sticky donji CTA ostaje jedini vidljivi submit na mobile (E2E sada klika vidljivi gumb).
- **Ne valja:** —

### `/request/[id]` — **PASS** (nakon kreiranja zahtjeva u E2E)
- **Valja:** Detalj stranica bez horizontalnog overflowa u testu; `UrgencyBadge` i unlock CTA prilagođeni dužem tekstu / modalu.
- **Ne valja:** —

### `/dashboard/handyman` + `/dashboard/handyman/credits` — **PASS**
- **Valja:** Nakon prijave majstora, obje rute bez overflowa; naslov „Krediti“ vidljiv na credits.
- **Ne valja:** —

### Admin (`/admin`) — **PASS**
- **Valja:** Shell učitava bez overflowa na mobile viewportu.
- **Ne valja:** Dubinski drawer/animacije nisu ručno klikane u ovom smoke setu (samo učitavanje + širina).

---

## 3. Tačni problemi koji su nađeni

1. **`UrgencyBadge`** — Dugi stringi („Hitno (u narednih 7 dana)“) mogli su izaći iz flex redova; dodato `max-w-full`, `whitespace-normal`, `break-words`, `leading-snug`.
2. **Unlock confirm modal** — Na niskim ekranima sadržaj mogao preći visinu; dodato `max-h-[min(90vh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain`.
3. **Unlock CTA dugme** — Dugi tekst sa brojem kredita; `min-h-14`, `whitespace-normal`, manji font na mobile, centriranje.
4. **`PremiumMobileHeader`** — `px-6` na 390px guši sadržaj; smanjeno na `px-3 sm:px-6` (i mobilni dropdown).
5. **How It Works (korisnici + majstori)** — Naslovi koraka bez `break-words` uz broj koraka; dodato `min-w-0 break-words` gdje treba.
6. **Homepage `<main>`** — Dodat `overflow-x-hidden` kao dodatna zaštita od širokih gradijenata/sekcija.
7. **E2E (nije „mobile UI“ ali blokiralo runtime)** — `create-request-submit` ima dva gumba (desktop skriven na mobile); `submitCreateRequestForm` sada klika **vidljivi** gumb. `createRequestAndWaitForRedirect` je čekao POST na `/api/requests`, a forma koristi **server action** — zamijenjeno čekanjem navigacije na `/request/[id]`.

---

## 4. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| `components/request/urgency-badge.tsx` | Wrapping / break za duge labele | Čitljivost na uskim širinama |
| `components/request/unlock-contact-button.tsx` | Scroll na modalu; fleksibilno unlock dugme | Modal staje na ekran; dugme se ne reže |
| `components/layout/PremiumMobileHeader.tsx` | Manji horizontalni padding na mobile | Više mjesta za logo + akcije |
| `components/home-page/HowItWorks.tsx` | `break-words` + `min-w-0` na naslovima | Bez ružnog preloma u karticama |
| `app/page.tsx` | `overflow-x-hidden` na `<main>` | Sprječava horizontalni „curenje“ |
| `playwright.config.ts` | Projekat `mobile` 390×844 | Stabilni mobile smoke |
| `tests/e2e/mobile-qa-smoke.spec.ts` | Novi smoke (overflow + ključne rute) | Runtime potvrda |
| `tests/e2e/helpers/request.ts` | Vidljivi submit; čekanje URL-a | Odgovara server actions + mobile UI |
| `tests/e2e/request.spec.ts` | Validacija koristi `submitCreateRequestForm` | Isti pristup vidljivom gumbu |

---

## 5. Runtime potvrda nakon popravki

| Ruta / skup | Rezultat |
|-------------|----------|
| Homepage mobile (390 + 360) | **PASS** |
| Request create mobile | **PASS** |
| Request detail mobile (nakon create u E2E) | **PASS** |
| Handyman dashboard + credits mobile | **PASS** |
| Admin mobile | **PASS** |

*(Izvršeno: `npx playwright test tests/e2e/mobile-qa-smoke.spec.ts --project=mobile` i `request.spec.ts --project=mobile` sa serverom na portu 3010.)*

---

## 6. Šta još ostaje otvoreno

- Ponašanje **virtualne tastature** na iOS/Android na `/request/create` (polja prekrivena poljem ili sticky CTA) — **nije** automatski testirano.
- **Pravi uređaj** (safe area, 100vh bugovi, momentum scroll) — preporučljiv ručni prolaz.
- **Admin** — dubinski klik kroz drawer i sve podstranice na mobile nije u ovom setu.

---

## 7. Završni status

**MOBILE UX JE DOVOLJNO ZATEGNUT ZA DALJI RAD**
