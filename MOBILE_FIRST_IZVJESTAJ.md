# Mobile-First Redesign – Izvještaj

**Datum:** 13.03.2025  
**Prioritet:** Mobilni prikaz prvo, desktop zatim  
**Build status:** ✅ Prolazi

---

## 1. Hero na telefonu

**Komponente:** `components/home-page/Hero.tsx`, `hero-search.tsx`

| Izmjena | Detalji |
|---------|---------|
| Visina | `min-h-[360px]` na mobilnom – kompaktan prvi ekran |
| Naslov | `text-2xl` → `sm:text-4xl` → `lg:text-5xl` |
| Podnaslov | Skraćen za mobil |
| Gradient overlay | Prilagođen mobilnom |
| Trust chipovi | Verifikovani, 4.8, Cijela Crna Gora – čitljivi na malom ekranu |

**Search kartica:**
- Layout: `flex-col sm:flex-row` – polja jedan ispod drugog na mobilnom
- Selecti: `h-14 min-h-[44px]`, dovoljno veliki za tap
- Dugme: full width na mobilnom (`w-full sm:w-auto`)
- Stil: `rounded-2xl shadow-xl`

---

## 2. Statistika (PlatformStatsSection)

**Komponenta:** `components/home-page/PlatformStatsSection.tsx`

- Grid: 2 kolone na mobilnom (`grid-cols-2`)
- Spacing: `py-10 sm:py-14 lg:py-16`
- Manje kartice na mobilnom, bez previše teksta

---

## 3. Kategorije

**Komponenta:** `components/home-page/CategoriesGrid.tsx`

- Layout: `grid-cols-2 gap-4` na mobilnom
- Kartice: `min-h-[120px]`, dovoljno velike za tap
- `active:scale-[0.98]` za feedback

---

## 4. Handyman kartice

**Komponenta:** `components/lists/handyman-card.tsx`

- Layout: vertikalan na mobilnom (`flex-col sm:flex-row`)
- Dugme: `min-h-[48px]`, full width
- Redoslijed: avatar + ime + ocjena → kategorija + grad → badge-ovi → cijena/iskustvo/odgovor → dugme
- Jednostavno skrolanje

---

## 5. Request flow

**Komponente:**  
`components/forms/create-request-form.tsx`, `request-success-banner.tsx`

- Forma: stacked inputi, `px-4 sm:px-6`
- Textarea: `rows={5}`, `min-h-[120px]`
- CTA: `h-14 min-h-[48px]`, full width
- Success banner: veća ikona, full width "Podijeli"

---

## 6. Profil majstora

**Stranica:** `app/handyman/[id]/page.tsx`

- Padding: `p-5 sm:p-8`
- Avatar: `h-24 sm:h-28` na mobilnom
- CTA: full width
- Galerija: `grid-cols-2 sm:grid-cols-3`
- Raspored: avatar → ime → ocjena → badge → CTA → trust info → galerija → opis → recenzije

---

## 7. Category page i mapa

**Komponente:**  
`app/category/[slug]/category-page-content.tsx`,  
`components/map/handyman-map-view.tsx`, `handyman-map-inner.tsx`

- Lista/Mapa toggle: `min-h-[48px]`, veći touch target
- Mapa: `h-56 min-h-[200px]` na mobilnom
- Padding: `px-4 sm:px-6`

---

## 8. Dashboard

**Stranice:** `app/dashboard/handyman/page.tsx`, `app/dashboard/user/page.tsx`

- Layout: stats u 2 kolone (`grid-cols-2 gap-4`)
- Padding: `px-4 py-6 sm:px-6 sm:py-8`
- Filter selecti: `min-h-[44px]`
- Notifikacije i krediti pregledni

---

## 9. Request detail

**Stranica:** `app/request/[id]/page.tsx`

- Padding: `px-4 py-6 sm:px-6 sm:py-8`
- Offer kartice: dugme "Prihvati" `h-14 min-h-[48px]`
- Send offer forma: prilagođena za mobil

---

## 10. Chat panel

**Komponenta:** `components/chat/request-chat-panel.tsx`

- Poruke: `max-h-[50vh]` na mobilnom, bolji pregled
- Buble: `px-4 py-3` na mobilnom
- Input + Send: `min-h-[48px]`, veća ikona slanja
- Form padding: `p-4 sm:p-3`

---

## 11. Notifikacije

**Komponenta:** `components/layout/notifications-dropdown.tsx`

- Dropdown: `w-[calc(100vw-2rem)]` na mobilnom
- Bell: `min-h-[44px]`
- Stavke: `min-h-[56px]`

---

## 12. Mobile nav

**Komponenta:** `components/layout/mobile-nav.tsx`

- Hamburger i zatvaranje: `min-h-[44px] min-w-[44px]`
- Nav stavke: `h-14 min-h-[48px]`, `text-base`
- `gap-2` između stavki

---

## 13. UI komponente (inputi)

**Fajlovi:** `components/ui/input.tsx`, `textarea.tsx`, `app/globals.css`

- Input/Textarea: `min-h-[48px]`, `text-base`
- Select-premium: `min-h-[48px]`

---

## Testirane stranice na mobilnoj širini

| Stranica | Status |
|----------|--------|
| Homepage | ✅ |
| Category page | ✅ |
| Handyman profile | ✅ |
| Create request | ✅ |
| Request detail | ✅ |
| Dashboard handyman | ✅ |
| Dashboard user | ✅ |
| Notifications | ✅ |
| Chat (request detail) | ✅ |

---

## Build

```bash
npm run build
# ✅ Prolazi bez grešaka
```

---

## Rezime

Mobile-first prilagodbe obuhvataju:

- Hero i search kartica – kompaktan layout, stacked forma, veliki touch targeti  
- Statistika, kategorije, handyman kartice – grid 2 kolone, vertikalne kartice  
- Request flow – stacked forma, full width CTA, jasno success stanje  
- Profil majstora – jednostavan vertikalni raspored  
- Mapa – jasan Lista/Mapa toggle, dobra visina  
- Dashboard – 2×2 stat kartice, pregledne liste  
- Chat – veći input i dugme za slanje  
- Mobile nav i notifikacije – veći touch targeti  
- Opšte – više spacinga, veći fontovi, lakši tap

Sajt je na telefonu prilagođen da izgleda kao moderna, premium aplikacija, a ne samo responsive desktop verzija.

---

## Završni mobile UX polish (13.03.2025)

### 1. Sticky CTA na homepage (mobile only)

**Nova komponenta:** `components/home-page/MobileStickyCTA.tsx`

- Fiksirana traka na dnu ekrana, samo na mobilnom (`md:hidden`)
- Dugme "Objavi zahtjev" → `/request/create`
- Stil: `bg-white/95`, `backdrop-blur`, `shadow-[0_-8px_24px_...]`, `safe-area-inset-bottom`
- Homepage dobija `pb-24 md:pb-0` da sticky CTA ne prekriva sadržaj

### 2. Bottom sheet filter na category page (mobile)

**Nova komponenta:** `components/category/MobileFilterSheet.tsx`

- Dugme "Filteri" pri vrhu stranice (mobile only)
- Klik otvara bottom sheet sa filterima: Grad, Sortiraj (ocjena/recenzije), Prikaz (Lista/Mapa), Brzi linkovi
- Panel: `rounded-t-3xl`, `max-h-[85vh]`, `overflow-y-auto`, backdrop overlay
- Zatvaranje: klik van, Escape, dugme X, "Primijeni"
- Desktop: zadržan postojeći sidebar

**Izmijenjen:** `app/category/[slug]/category-page-content.tsx` – sidebar skriven na mobile (`hidden lg:block`), dodato Filter dugme i `MobileFilterSheet`

### 3. Sticky chat input na mobile

**Izmijenjen:** `components/chat/request-chat-panel.tsx`

- Chat panel: `flex flex-col`, `max-h-[60vh]` na mobilnom
- Poruke: `flex-1 min-h-0 overflow-y-auto` – skroluju iznad inputa
- Input zona: `shrink-0`, uvijek na dnu panela
- Stil na mobilnom: `bg-white/95`, `backdrop-blur`, `border-t`, safe-area padding
- Desktop layout nepromijenjen

### Izmijenjeni fajlovi

| Fajl | Izmjena |
|------|---------|
| `app/page.tsx` | Import `MobileStickyCTA`, `pb-24 md:pb-0`, render CTA |
| `app/category/[slug]/category-page-content.tsx` | Sidebar `hidden lg:block`, Filter dugme, `MobileFilterSheet` |
| `components/chat/request-chat-panel.tsx` | Flex layout, sticky input, safe-area |

### Nove komponente

- `components/home-page/MobileStickyCTA.tsx`
- `components/category/MobileFilterSheet.tsx`

### Build

```bash
npm run build
# ✅ Prolazi
```
