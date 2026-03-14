# Finalna faza dorada – Majstor.me

**Datum:** 13.03.2025  
**Status:** Završeno

---

## Pregled implementiranih faza

### FAZA A — Finalni trust sloj ✅
- **HandymanCard** – verified badge, prosječna ocjena, broj recenzija, broj završenih poslova, prosječno vrijeme odgovora, premium badge, status dostupnosti
- **PlatformStatsSection** – homepage sekcija sa statistikama (broj majstora, završeni poslovi, prosječna ocjena, gradovi/kategorije) sa fallback arhitekturom kada nema podataka
- **API `/api/stats/platform`** – vraća platforme statistike
- **API `/api/handymen`** – mapItem uključuje sva trust polja

**Fajlovi:** `components/lists/handyman-card.tsx`, `components/home-page/PlatformStatsSection.tsx`, `app/api/stats/platform/route.ts`, `app/api/handymen/route.ts`

---

### FAZA B — Avatar upload i galerija ✅
- **`lib/storage.ts`** – apstrakcija uploada (Supabase Storage, fetch fallback)
- **`/api/upload`** – POST za avatar/gallery/request, GET za `uploadAvailable`
- **GalleryEditor** – upload + URL fallback, validacija (tip, veličina, max broj)
- **AvatarUpload** – upload avatara + URL fallback
- **HandymanProfileForm** – integrisan AvatarUpload i galerija

**Fajlovi:** `lib/storage.ts`, `app/api/upload/route.ts`, `components/profile/gallery-editor.tsx`, `components/profile/avatar-upload.tsx`

---

### FAZA C — Request Flow 2.0 ✅
- **RequestPhotosEditor** – dodavanje do 5 slika (upload ili URL)
- **CreateRequestForm** – polje photos, bolji placeholder za opis, redirect sa `?created=1&notified=X`
- **RequestSuccessBanner** – prikaz nakon objave, „Obavijestili smo X majstora“, opcija podijeli zahtjev
- **Request detail** – integrisan success banner

**Fajlovi:** `components/forms/request-photos-editor.tsx`, `components/forms/create-request-form.tsx`, `components/request/request-success-banner.tsx`, `app/request/[id]/page.tsx`, `app/api/requests/route.ts`

---

### FAZA D — Smart distribution ✅
- **`lib/smart-distribution.ts`** – `rankHandymenForRequest()`, config `TOP_N_NOTIFY`, `ENABLED`
- **POST `/api/requests`** – koristi smart distribution; samo top N majstora dobijaju email
- Svi relevantni majstori i dalje vide zahtjeve u dashboardu
- Env: `SMART_DISTRIBUTION_ENABLED`, `SMART_DISTRIBUTION_TOP_N` (default 20)

**Fajlovi:** `lib/smart-distribution.ts`, `app/api/requests/route.ts`

---

### FAZA E — Map view ✅
- **HandymanMapView**, **HandymanMapInner** – Leaflet mapa sa markerima
- **Lista/Mapa toggle** na category stranicama
- **API `/api/handymen`** – vraća `lat`, `lng` za majstore (na osnovu grada)
- Koordinate iz `lib/cities.ts` (CITY_COORDS)

**Fajlovi:** `components/map/handyman-map-view.tsx`, `components/map/handyman-map-inner.tsx`, `app/category/[slug]/category-page-content.tsx`, `app/api/handymen/route.ts`  
**Zavisnosti:** `leaflet`, `react-leaflet@4`, `@types/leaflet`

---

### FAZA F — Monetizacija (krediti i premium) ✅
- **Prisma** – `HandymanProfile.creditsBalance`, model `CreditTransaction`
- **`lib/credits.ts`** – `spendCreditsForOffer`, `hasEnoughCredits`, `isCreditsRequired()`
- **`lib/credit-packages.ts`** – CREDIT_PACKAGES (5, 10, 25, 50 kredita)
- **`lib/payment.ts`** – apstrakcija za Stripe (stub, spreman za integraciju)
- **POST `/api/offers`** – provjera kredita kada je `CREDITS_REQUIRED=true`
- **SendOfferForm** – CTA „Kupi kredite“ na 402
- **Dashboard handyman** – prikaz balansa kredita, link ka kupovini
- **`/dashboard/handyman/credits`** – stranica za kupovinu paketa
- **`/api/checkout/credits`** – API za kreiranje checkout sessije

**Fajlovi:** `lib/credits.ts`, `lib/credit-packages.ts`, `lib/payment.ts`, `app/api/offers/route.ts`, `app/api/checkout/credits/route.ts`, `components/forms/send-offer-form.tsx`, `app/dashboard/handyman/page.tsx`, `app/dashboard/handyman/credits/page.tsx`, `components/credits/credits-purchase-button.tsx`  
**Migracija:** `credits_balance`, `credit_transactions`

---

### FAZA G — Notifikacije 2.0 ✅
- **GET `/api/notifications`** – parametar `limit` (5–50, default 20)
- **NotificationsDropdown** – limit 15, bolji empty state, link na dashboard ako nema linka

**Fajlovi:** `app/api/notifications/route.ts`, `components/layout/notifications-dropdown.tsx`

---

### FAZA H — Analitika i konverzije ✅
- **Admin dashboard** – Conversion funnel (Zahtjevi → Ponude → Prihvaćene → Završeni → Recenzije)
- Grafici: zahtjevi po danu (već postojalo)

**Fajlovi:** `app/admin/page.tsx`

---

### FAZA I — SEO finalno zatezanje ✅
- **`lib/json-ld.ts`** – `organizationJsonLd`, `localBusinessJsonLd`, `faqPageJsonLd`
- **Homepage** – Organization + FAQPage JSON-LD
- **Handyman profil** – LocalBusiness JSON-LD (ime, opis, slika, adresa, aggregateRating)
- **`lib/faq-data.ts`** – centralizovani FAQ podaci
- **Canonical** – na layout i handyman stranici (već postojalo)

**Fajlovi:** `lib/json-ld.ts`, `lib/faq-data.ts`, `app/page.tsx`, `app/handyman/[id]/page.tsx`, `components/home-page/FAQ.tsx`

---

### FAZA J — UX i mobile polish ✅
- **Breadcrumbs** – komponenta i upotreba na create request stranici
- **Empty states** – notifikacije, mapa
- **InviteHandymanForm** – uključen u request detail

**Fajlovi:** `components/ui/breadcrumbs.tsx`, `app/request/create/page.tsx`, `components/layout/notifications-dropdown.tsx`

---

### FAZA K — Pozovi majstora / viral loop ✅
- **Model HandymanInvite** – inviterId, email, phone, requestId, token, status
- **POST `/api/invite-handyman`** – kreiranje pozivnice, vraća invite link
- **InviteHandymanForm** – email/telefon unos, kopiranje linka
- Integrisano na request detail stranici za vlasnike otvorenih zahtjeva

**Fajlovi:** `prisma/schema.prisma`, `app/api/invite-handyman/route.ts`, `components/invite/invite-handyman-form.tsx`, `app/request/[id]/page.tsx`  
**Migracija:** `handyman_invites` tabela

**Nedostaje:** Slanje emaila majstoru (TODO u API-ju kada je Resend spreman)

---

### FAZA L — Cleanup i production check ✅
- **PRODUCTION_CHECKLIST.md** – env varijable, migracije, storage, email, payment, rate limiting
- **Build** – prolazi bez grešaka

**Fajlovi:** `PRODUCTION_CHECKLIST.md`

---

## Šta je ostalo / opciono

| Stavka | Opis |
|--------|------|
| Stripe integracija | Implementirati `createCreditsCheckout` u `lib/payment.ts`, webhook za dodavanje kredita |
| Slanje invite emaila | U `POST /api/invite-handyman` pozvati `sendInviteEmail()` kada je Resend spreman |
| Dnevni digest | Arhitektura spremna; scheduler + email template za majstore |
| Registracija preko invite linka | `/register?invite=TOKEN` – povezati sa zahtjevom nakon registracije |

---

## Env varijable (dodatno)

| Varijabla | Opis |
|-----------|------|
| `SMART_DISTRIBUTION_ENABLED` | `false` = broadcast svima; `true` = samo top N |
| `SMART_DISTRIBUTION_TOP_N` | Broj majstora koji dobijaju email (default 20) |
| `CREDITS_REQUIRED` | `true` = majstori moraju imati kredite za ponude |

---

## Migracije

```bash
npx prisma db push
# ili: npx prisma migrate deploy
```

Nove tabele/polja: `credit_transactions`, `credits_balance` (handyman_profiles), `handyman_invites`.
