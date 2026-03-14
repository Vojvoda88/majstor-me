# Prompt za novog agenta – Majstor.me

Kopiraj cijeli sadržaj ispod i zalijepi kao poruku novom agentu.

---

## Kontekst projekta

**Majstor.me** je marketplace platforma za pronalaženje majstora u Crnoj Gori. Tech stack:
- **Next.js 14** (App Router)
- **Prisma** (PostgreSQL)
- **NextAuth** (USER / HANDYMAN role)
- **Tailwind CSS**
- **TypeScript**

## Šta je urađeno (NE DIRAJ OVO)

1. **Backend i logika**
   - Prisma modeli, API rute, auth, business logika – sve radi
   - Smart distribution, krediti, notifikacije, chat, recenzije, invite flow
   - API: `/api/handymen`, `/api/requests`, `/api/stats/platform`, `/api/offers`, itd.

2. **Premium mobile-first frontend (završeno 13.03.2025)**
   - **PremiumMobileHeader** – fixed, blur, logo lijevo, avatar/menu desno
   - **StickyBottomCTA** – reusable sticky CTA bar (mobile only)
   - **Hero** – naslov, podnaslov, search kartica, trust chipovi (Verifikovani, Ocjena 4.8, Svi gradovi)
   - **HomeStatsSection** – 4 stat kartice (majstori, poslovi, ocjena, gradovi)
   - **CategoriesGrid** – 6 top kategorija + "Vidi još kategorija"
   - **TopMasters** – 1–2 featured handyman kartice sa `PremiumHandymanCard`
   - **HowItWorks**, **FAQ**, **CTAForMasters** – sekcije
   - **Category page** – quick chips (Svi gradovi, Filteri, Lista/Mapa segment), `PremiumHandymanCard`, `MobileFilterSheet`
   - **Create request** – sticky submit CTA, default grad "Svi gradovi" (vrijednost prazna)
   - **Dashboard** – PremiumMobileHeader, StickyBottomCTA (User: "Objavi zahtjev", Handyman: "Kupi kredite" / "Pregledaj zahtjeve")
   - **Handyman profile** – PremiumMobileHeader, sticky CTA

3. **Globalni dizajn sistem**
   - background: `#F4F7FB`, text: `#0F172A`, secondary: `#475569`
   - primary: `#2563EB`, gradient: `#60A5FA` → `#2563EB`
   - max mobile width: 430px, padding: 16px
   - radius 18–24px, min height inputa/dugmadi: 48px+
   - Za gradove koristimo **"Svi gradovi"** (ne "Cijela Crna Gora")

## Struktura fajlova (bitno)

```
app/
  page.tsx                 # Homepage
  category/[slug]/         # Lista majstora po kategoriji
  handyman/[id]/           # Profil majstora
  request/create/          # Kreiranje zahtjeva
  request/[id]/            # Detalj zahtjeva (chat, ponude, review)
  dashboard/user/          # Korisnički dashboard
  dashboard/handyman/      # Dashboard majstora
  dashboard/layout.tsx     # PremiumMobileHeader

components/
  layout/
    PremiumMobileHeader.tsx
    StickyBottomCTA.tsx
    site-header.tsx        # stari, koristi se na nekim stranicama
  home-page/
    Hero.tsx, hero-search.tsx
    CategoriesGrid.tsx, TopMasters.tsx
    HomeStatsSection.tsx
  lists/
    PremiumHandymanCard.tsx
    handyman-card.tsx      # stari variant
  category/
    MobileFilterSheet.tsx  # bottom sheet filter (mobile)
  forms/
    create-request-form.tsx
```

## Pravila za rad

1. **NE DIRAJ:** backend, API, Prisma schema, auth, business logiku, rute
2. **Mijenjaj samo:** frontend UI/UX, React/Next komponente, Tailwind klase
3. **Mobile-first:** prioritet broj 1, desktop zatim
4. **Build mora proći:** nakon svake izmjene pokreni `npm run build`
5. **Kad vraćaš kod:** daj **kompletan** kod fajlova koje mijenjaš, ne diff-ove. Korisnik želi copy/paste ready kod.

## Korisne komande

```bash
cd c:\Users\Jovan\Desktop\MajstorMe
npm run build
npm run dev
```

## Dokumentacija u projektu

- `MOBILE_FIRST_IZVJESTAJ.md` – mobile UX detalji
- `FAZA_FINAL_DORADE_IZVJESTAJ.md` – implementirane faze (trust, galerija, smart distribution, mapa, krediti, notifikacije, itd.)
- `FAZA_15_ZAVRSNI_IZVJESTAJ.md` – pregled faza 1–15
- `PRODUCTION_CHECKLIST.md` – env, migracije, deployment

## Kako nastaviti

Kada korisnik da zadatak:
1. Pročitaj relevantne fajlove
2. Napravi izmjene samo na frontendu
3. Vrati kompletan kod izmijenjenih komponenti (cijeli fajl)
4. Provjeri build

Nemoj davati samo "evo šta da promijeniš" – daj gotov kod koji može zalijepiti.
