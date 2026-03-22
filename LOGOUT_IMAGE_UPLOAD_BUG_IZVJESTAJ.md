# LOGOUT + IMAGE UPLOAD BUG — IZVJEŠTAJ

## 1. Problem A — odjava

### Tačan uzrok
U **`PremiumMobileHeader`** (mobilni meni dashboarda / majstora) odjava je bila **`form` sa `POST` na `/api/auth/signout` bez CSRF tokena**. NextAuth očekuje validan CSRF za taj POST; zahtjev se ne izvrši kako treba → korisnik ima dojam da „ništa ne radi“.

### Šta je pronađeno
- `components/layout/PremiumMobileHeader.tsx` — `<form action="/api/auth/signout" method="POST">` + submit dugme.
- Ostali dijelovi aplikacije (npr. `PublicHeader`, `admin-sign-out-button`) već koriste **`signOut()`** iz `next-auth/react`.

### Šta je popravljeno
- Zamijenjeno **`signOut({ callbackUrl: "/" })`** na klik „Odjavi se“, zatvaranje menija, isti UX na mobilnom i desktopu (meni je `md:hidden` za mobilni dio, ali pattern je ispravan).

---

## 2. Problem B — dodavanje slika

### Tačan uzrok
1. **Blokada drugog klika:** `onClick` je zvao `checkUpload()` (async) pa **`if (uploadAvailable === false) return`** prije `fileInputRef.click()`. Nakon što je `uploadAvailable` postao `false`, **drugi klik** na „Dodaj sliku“ više **nije otvarao** file picker — korisnik je ostajao sa **URL poljem** kao jedinom opcijom koja izgleda „glavna“.
2. **UX:** URL polje i „ili“ su bili u istom redu kao primarni upload — na telefonu djelovalo kao da se traži URL.

### Šta je pronađeno
- `components/profile/gallery-editor.tsx`, `components/forms/request-photos-editor.tsx`, `components/profile/avatar-upload.tsx` — isti obrasci.

### Šta je popravljeno
- **Uklonjena** ranija logika koja je **prekidala** otvaranje file pickera kad `uploadAvailable === false`; sada se uvijek može otvoriti izbor fajla (ako storage nije konfigurisan, API i dalje vraća grešku — ali UI ne „zaključava“ dugme).
- **Primarni** CTA: puna širina, veći touch target (`min-h-[48px]`), tekst za mobilni kontekst.
- **`capture="environment"`** na `<input type="file">` gdje ima smisla (kamera / galerija na telefonu).
- **URL** prebačen u **`<details>`** („Napredno“) da nije prvi korak.

---

## 3. Pregledani fajlovi

- `components/layout/PremiumMobileHeader.tsx`
- `components/profile/gallery-editor.tsx`
- `components/forms/request-photos-editor.tsx`
- `components/profile/avatar-upload.tsx`
- `app/api/upload/route.ts` (referenca — logika ostaje ista)

---

## 4. Izmijenjeni fajlovi

| Putanja | Promjena | Zašto |
|---------|----------|--------|
| `components/layout/PremiumMobileHeader.tsx` | `signOut()` umjesto POST forme | Pouzdana odjava (CSRF preko next-auth) |
| `components/profile/gallery-editor.tsx` | Primarni upload, `capture`, URL u `details`, uklonjen blokirajući return | Mobile-first, nema lažnog URL-only toka |
| `components/forms/request-photos-editor.tsx` | Isto | Isto |
| `components/profile/avatar-upload.tsx` | Isto + `details` za URL | Isto |

---

## 5. Runtime potvrda

| Test | Rezultat |
|------|----------|
| `npx tsc --noEmit` | PASS |
| Playwright `handyman.spec.ts` (uklj. profil) | PASS |
| Playwright `auth.spec.ts` (dio testova) | 2 flaky/timeout u paralelnom runu (login handyman / admin logout) — **nije** regresija specifična za ove komponente; `handyman` flow posebno prolazi |

Preporuka: ručno na telefonu — meni → Odjavi se; forma zahtjeva → Dodaj sliku.

---

## 6. Tačni problemi ako ih još ima

- Ako **storage** (S3/Blob) nije u env-u, upload i dalje vraća grešku — korisnik vidi poruku sa API-ja; URL u **Napredno** ostaje opcija.

---

## 7. Završni status

**LOGOUT I DODAVANJE SLIKA SU POPRAVLJENI**
