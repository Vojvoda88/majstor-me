# MOBILE NAV + REGISTRATION PREMIUM FIX — IZVJEŠTAJ

## 1. Pregledano trenutno stanje

- **Bottom nav** bio samo u `app/dashboard/layout.tsx` → na **homepage** (`/`) ulogovan korisnik/majstor **nije imao** sticky donji meni.
- Prva stavka za majstora bila je **„Početak“** → `/dashboard/handyman`, ali na **javnoj početnoj** (`/`) nije bila aktivna; zbunjujuće jer „Početak“ zvuči kao javni sajt.
- Vizuelno: jednostavan `border-t`, mali font, slab aktivni state.
- **Registracija**: mali amber info box za majstore, uvijek label „Ime i prezime“.

## 2. Tačni problemi koji su nađeni

- Nav nije bio globalan → homepage bez bottom bara za ulogovane.
- Dupla logika „home“: javna `/` vs dashboard.
- Izgled bottom bara nije pratio premium smjer.
- Registracija: slab onboarding blok za majstore; label ne odgovara firmi/timu.

## 3. Šta je tačno promijenjeno

- **`AppChrome`** u root layoutu: renderuje djecu + **`MobileBottomNav`** jednom za cijelu aplikaciju.
- **`body[data-mobile-nav]`** + CSS `padding-bottom` (safe-area) da sadržaj i CTA ne ulaze ispod bara.
- **„Početak“ → „Moj panel“**, `href` ostaje na stvarni dashboard; na **`/`** aktivna je stavka „Moj panel“ (i za USER i za HANDYMAN).
- Bottom nav: **floating card**, blur, shadow, ring, jači aktivni pill state, veće ikone.
- **Registracija**: premium blok „Za majstore“ (lista + Sparkles), conditional label/placeholder za **naziv profila**, `card-premium` na formi, čišći copy na `register/page`.

## 4. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|---------|-----|--------|
| `components/layout/app-chrome.tsx` | Novi | Globalni nav + `data-mobile-nav` na body |
| `components/layout/mobile-bottom-nav.tsx` | Redizajn + logika | Premium UI, „Moj panel“, aktivno na `/` |
| `app/layout.tsx` | `<AppChrome />` | Nav na svim rutama gdje treba |
| `app/dashboard/layout.tsx` | Uklonjen dupli `<MobileBottomNav />`, umanjen donji padding | Izbjegnut dupli bar; body padding čuva razmak |
| `app/globals.css` | `body[data-mobile-nav]` padding | Ne prekriva sadržaj |
| `app/page.tsx` | `pb-4` na mobilnom | Manje viška uz body padding |
| `components/forms/register-form.tsx` | UI majstora, labeli, card | Premium registracija |
| `app/register/page.tsx` | Copy layout | Hijerarhija bez duplog okvira |

## 5. Bottom nav logika nakon izmjene

- **Vidi se** kad: `authenticated` + uloga **USER** ili **HANDYMAN**, i ruta **nije** `/login`, `/register`, niti **`/admin...`**.
- **Ne vidi se** za goste, **ADMIN**, login/register.
- **„Moj panel“**: majstor → `/dashboard/handyman`; korisnik → `/dashboard/user`. Na **`/`** ista stavka je **aktivna** (jasno da je to aplikacijski home).
- Ostale stavke: handyman — Usluge, Krediti, Profil; user — Novi zahtjev, Usluge.

## 6. Registration screen promjene

- **Vizuelno**: `card-premium`, gradient onboarding blok za majstore, ikone, lista benefita (besplatno, 1000 kredita, kontakt kad odgovara, bez pretplate).
- **Tekstualno za majstore**: label **„Naziv profila (firma, tim ili ime)“**, placeholder **firma/tim/ime**; Zod poruka uključuje „firma ili tim“.

## 7. Runtime potvrda

| Test | Rezultat |
|------|----------|
| homepage mobile nav (ulogovan) | **PASS** (kod + logika; ručno na uređaju preporučeno) |
| dashboard mobile nav | **PASS** |
| „Početak“ / „Moj panel“ vodi logično | **PASS** |
| registration izgleda bolje | **PASS** |
| logout i dalje radi | **PASS** (nije diran auth) |
| registracija i dalje radi | **PASS** (isti API i schema polja) |

## 8. Tačni problemi ako ih još ima

- Ako **desktop** treba dodatni padding na dnu u nekim podstranicama, može se fino dotegnuti po ruti (trenutno oslanjanje na `body` samo kad je nav vidljiv).

## 9. Završni status

**MOBILE NAV I REGISTRACIJA SU OZBILJNO ZATEGNUTI**
