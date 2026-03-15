# Critical performance check – root layout i global providers

**Datum:** Ožujak 2025  
**Fokus:** Da li je glavni uzrok sporosti root layout i global providers; razdvajanje public vs authenticated vs admin.

---

## 1. Analiza app/layout.tsx i globalnih providera

### Root layout (app/layout.tsx)

- Uvodi: fontove (Inter, DM Sans, Outfit), Analytics, globals.css, **Providers**.
- Tijelo: `<Providers>{children}</Providers>` + `<Analytics />`.
- **Providers** je jedini globalni wrapper – sve stranice prolaze kroz njega.

### Prije izmjene (app/providers.tsx)

```tsx
SessionProvider
  → QueryClientProvider (React Query)
      → PwaProvider (PWA, useSession, push subscribe)
          → {children}
```

- **SessionProvider** (next-auth) – potreban na svim stranicama gdje header prikazuje Prijava vs profil.
- **QueryClientProvider** (@tanstack/react-query) – korišten u dashboard, admin, request (forme, ponude, unlock).
- **PwaProvider** – registracija SW, push subscribe za HANDYMAN; koristi `useSession()`.

Sve tri stvari učitavale su se na **svakoj** stranici, uključujući čisto javne (/, /categories, /login, /register, /handyman/[id], …).

---

## 2. Šta se na javnim stranicama učitavalo (prije)

| Provider / logika | Na javnim stranicama? | Potreban na javnim? |
|-------------------|------------------------|----------------------|
| **SessionProvider** | Da | **Da** – header (PremiumMobileHeader) koristi `useSession()` za Prijava vs profil / Admin. |
| **QueryClientProvider** | Da | **Ne** – React Query se koristi samo u dashboard, admin, request (forme, ponude, unlock). |
| **PwaProvider** | Da | **Ne** – PWA / push ima smisla samo za ulogovane (npr. HANDYMAN). |
| **Notifications logic** | Samo u headeru na dashboardu (NotificationsDropdown) | Ne na čisto javnim stranicama. |

Zaključak: na javnim stranicama su bili suvišni **QueryClientProvider** i **PwaProvider** (i sve njihove ovisnosti).

---

## 3. Razdvajanje: public vs authenticated vs admin

Implementirano je razdvajanje providera po rutama (bez mijenjanja URL strukture):

- **Root (sve stranice):** samo **SessionProvider**.  
  - Javne stranice dobivaju samo session kontekst (za header).
- **Dashboard, admin, request:** posebni layouti koji dodaju **AppProviders** (QueryClient + Pwa).  
  - Ovi provideri učitavaju se samo kad korisnik uđe u te dijelove aplikacije.

### Konkretne izmjene

| Fajl | Promjena |
|------|----------|
| **app/providers.tsx** | Sadrži **samo** `<SessionProvider>{children}</SessionProvider>`. Uklonjeni QueryClientProvider i PwaProvider. |
| **app/app-providers.tsx** | **Novi.** Eksportira `AppProviders`: `<QueryClientProvider><PwaProvider>{children}</PwaProvider></QueryClientProvider>`. |
| **app/dashboard/layout.tsx** | Omotavanje u `<AppProviders>` – dashboard koristi React Query i PWA. |
| **app/admin/layout.tsx** | Omotavanje u `<AppProviders>` – admin koristi React Query (npr. verify-button). |
| **app/request/layout.tsx** | **Novi.** Samo `<AppProviders>{children}</AppProviders>` – request/create i request/[id] koriste React Query (forme, ponude, unlock). |

Nema posebnog “public layout” fajla: sve što nije pod dashboard, admin ili request i dalje prima samo root layout (SessionProvider). To su javne rute: /, /categories, /category/[slug], /grad/[slug], /handyman/[id], /login, /register itd.

---

## 4. Homepage i public header – useSession

- **PremiumMobileHeader** (koristi se na homepageu i drugim stranicama) koristi **useSession()** da:
  - prikaže “Prijava” / “Registracija” kad nema session,
  - prikaže link na profil (ili Admin) i avatar/inicijal kad ima session.
- To je **opravdana** upotreba: bez sessiona ne bismo znali šta prikazati u headeru.  
- **Zaključak:** SessionProvider na rootu je potreban; homepage i dalje treba session request za ispravan header. Nije suvišno.

---

## 5. Client wrapper koji pretvara u client render

- **Providers** (root) je “use client” i omotava cijelo drvo. To **mora** biti client komponenta jer SessionProvider je client-side.
- Zbog toga root layout šalje client boundary: sve ispod Providers može koristiti client komponente, ali to ne pretvara automatski sve stranice u client render – stranice ostaju server komponente osim ako same nemaju "use client" ili ne uvoze client komponente.
- **Optimizacija:** Smanjili smo **šta** se u rootu učitava (samo SessionProvider), tako da QueryClient i Pwa više nisu u kritičnom putu za javne stranice. Nema dodatnog “teškog” client wrappera koji bi cijeli public dio pretvarao u client render.

---

## 6. Šta se sada učitava globalno vs po rutama

| Šta | Gdje se učitava |
|-----|------------------|
| **SessionProvider** | Globalno (root). Potreban za header (Prijava/profil/Admin) na svim stranicama. |
| **QueryClientProvider** | Samo u **dashboard**, **admin**, **request** (preko AppProviders u njihovim layoutima). |
| **PwaProvider** | Samo u **dashboard**, **admin**, **request** (unutar AppProviders). |
| **Analytics** | Globalno (root). |

Na čisto javnim rutama (/, /categories, /login, /register, /handyman/[id], /category/[slug], /grad/[slug]) sada se **ne učitavaju** React Query ni PwaProvider.

---

## 7. Šta je izdvojeno iz “public” dijela

- **QueryClientProvider** – više nije u rootu; učitava se samo za `/dashboard/*`, `/admin/*`, `/request/*`.
- **PwaProvider** – isto; samo u layoutima dashboarda, admina i requesta.

Time je “public” dio (sve ostale rute) ima minimalniji set providera: samo SessionProvider (+ fontovi, Analytics, globals).

---

## 8. Novi First Load JS (homepage)

- U buildu: **First Load JS za “/”** i dalje **118 kB** (8.39 kB page + 87.7 kB shared).
- **“First Load JS shared by all”** ostaje **87.7 kB** u izvještaju builda.

Mogući razlozi zašto broj još uvijek 118 kB:

- Zajednički chunk vjerojatno uključuje React, next-auth (SessionProvider), Next.js runtime i sl. – to i dalje treba na svim stranicama.
- React Query i Pwa mogu biti već code-splitani po rutama koje ih koriste, pa su prije izmjene možda bili u posebnim chunkovima koje homepage nije morao učitati u “first load” u svim slučajevima.

Arhitekturno: na homepageu (i ostalim javnim rutama) više **nikad** ne renderiraš QueryClientProvider ni PwaProvider, pa se njihov kod ne učitava u kritičnom putu za te rute. Dashboard, admin i request i dalje učitavaju AppProviders kad korisnik tamo uđe.

---

## 9. Da li homepage i dalje radi session request?

**Da.**  
Homepage koristi **PremiumMobileHeader**, koji koristi **useSession()**. NextAuth (SessionProvider) na učitavanju stranice obično pozove session (npr. `getSession` ili `/api/auth/session`). To je očekivano i potrebno da bi header prikazao “Prijava” ili profil/Admin. Nije uklonjeno niti promijenjeno.

---

## 10. Procjena ubrzanja nakon promjene

- **Javne stranice (/, categories, login, register, handyman/[id], …):**
  - Manji dependency tree: nema React Query ni PwaProvider u stablu.
  - Manje JS-a koje browser mora parsirati i izvršiti na prvom učitavanju tih stranica (ovisno o tome koliko je Query/Pwa bio u zajedničkom chunku).
  - Manji rizik od nepotrebnog poziva ili inicijalizacije PWA logike na čisto javnim stranicama.

- **Ubrzanje:** Procjena **5–15%** na LCP/TTI za čisto javne stranice ako su prije u isti “first load” ulazili i chunkovi za Query/Pwa; ako su već bili lazy, dobitak je više u čistoći arhitekture i održavanju (jasna granica public vs app).

- **Stabilnost:** Dashboard, admin i request i dalje imaju punu funkcionalnost (React Query, PWA) jer AppProviders omotava samo te rute.

---

## Sažetak

| Pitanje | Odgovor |
|--------|---------|
| Šta se učitava globalno? | Samo **SessionProvider** (+ fontovi, Analytics, globals). |
| Šta je bilo suvišno na javnim stranicama? | **QueryClientProvider** i **PwaProvider**. |
| Šta je izdvojeno iz public dijela? | QueryClient i Pwa – učitavaju se samo u **dashboard**, **admin**, **request** (AppProviders u njihovim layoutima). |
| Novi First Load JS (homepage)? | U buildu i dalje **118 kB**; zajednički chunk 87.7 kB. Arhitektura je smanjena na minimalan set providera za public. |
| Da li homepage i dalje radi session request? | **Da** – potreban je za header (useSession u PremiumMobileHeader). |
| Procjena ubrzanja? | **5–15%** na javnim stranicama ako je prije u first load ulazio i kod za Query/Pwa; inače jasna granica public vs app i manji dependency tree za public. |
