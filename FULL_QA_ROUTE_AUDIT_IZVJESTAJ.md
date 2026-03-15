# FULL APPLICATION QA + ROUTE AUDIT + CLICK TEST – Izvještaj

**Datum:** 14.03.2025  
**Opseg:** Kompletan audit javnog dijela, auth flowa, request flowa, handyman flowa, admin flowa, navigacije i PWA/manifesta.

---

## 1. Rute koje su provjerene

### Javne stranice
| Ruta | Status | Napomena |
|------|--------|----------|
| `/` | OK | Homepage, PublicHeader, linkovi na /categories, /#kako-radi, /register, /login, StickyBottomCTA → /request/create |
| `/categories` | OK | Lista kategorija |
| `/category/[slug]` | OK | CategoryPageContent, filteri, CTA → /request/create |
| `/grad/[slug]` | OK | Grad stranica, CTA → /request/create |
| `/handyman/[id]` | OK | Javni profil majstora, force-dynamic, link na /request/create |
| `/[slug]` | OK | SEO landing (category+city), notFound ako slug nije validan |
| `/login` | OK | Redirect ako session; LoginForm, link na /register i / |
| `/register` | OK | Redirect ako session; RegisterForm, ?type=majstor za HANDYMAN |
| `/request/create` | OK | Nije zaštićeno (guest može); CreateRequestForm, redirect na /request/[id] sa tokenom nakon submit |
| `/request/[id]` | OK | Zaštićeno po ownership (userId ili token); SiteHeader, ponude, chat, unlock kontakt |

### Dashboard
| Ruta | Zaštita | Status |
|------|---------|--------|
| `/dashboard/user` | auth, role USER | OK, linkovi na /request/create i /request/[id] |
| `/dashboard/handyman` | auth, role HANDYMAN | OK, HandymanRequestList → /request/[id], link na profile i credits |
| `/dashboard/handyman/profile` | auth, HANDYMAN | OK |
| `/dashboard/handyman/credits` | auth, HANDYMAN | OK |

### Admin
| Ruta | Zaštita | Status |
|------|---------|--------|
| `/admin` | requireAdminPermission("dashboard") | OK (nakon emergency fixa, bez unstable_cache) |
| `/admin/moderation` | permission moderation | OK, tabovi (reports, pending requests, workers, spam) |
| `/admin/handymen` | permission workers | OK, paginacija 25 |
| `/admin/users` | permission users | OK, paginacija 25 |
| `/admin/requests` | permission requests | OK, paginacija 25, filteri |
| `/admin/requests/[id]` | permission requests | OK, detalj, approve/reject/spam/delete/restore |
| `/admin/offers` | permission offers | OK |
| `/admin/credits` | permission credits | OK |
| `/admin/payments` | permission payments | OK |
| `/admin/chat` | permission chat | OK |
| `/admin/categories` | permission categories | OK |
| `/admin/cities` | permission cities | OK |
| `/admin/notifications` | permission notifications | OK |
| `/admin/trust-safety` | permission trust_safety | OK |
| `/admin/content` | permission content | OK |
| `/admin/settings` | permission settings | OK |
| `/admin/audit` | permission audit_log | OK |
| `/admin/reports` | redirect | Redirect na /admin/moderation (namjerno) |
| `/admin/users/[id]` | permission | OK, notFound ako user ne postoji |
| `/admin/handymen/[id]` | permission | OK, notFound ako nema profil |

---

## 2. Stranice koje su bile pokvarene / nedovršene (i šta je popravljeno)

### 2.1 PremiumMobileHeader – mobilni meni za prijavljene korisnike
- **Problem:** Kada je korisnik prijavljen, u mobilnom meniju (hamburger) nisu bili prikazani link "Moj dashboard" niti "Odjavi se". Samo su bili Kategorije, Kako radi i (za admin) Admin panel. Korisnik nije mogao doći do dashboarda ili odjave iz mobilnog menija.
- **Popravljeno:** U mobilnom meniju, kada postoji `session`, dodani su link "Moj dashboard" (vodí na /dashboard/handyman, /dashboard/user ili /admin ovisno o roli) i dugme "Odjavi se" (form action="/api/auth/signout" method="POST"). Desktop navigacija je također prebačena sa `<a href>` na `<Link>` za /categories i /#kako-radi radi konzistentne SPA navigacije.

### 2.2 PWA manifest – start_url
- **Problem:** `start_url` je bio `getSiteUrl() + "/"`, što u dev okruženju (localhost) može biti druga origin od trenutne (npr. https://majstor.me). PWA zahtijevaju same-origin start_url da ne bi bilo upozorenja ili pogrešnog ponašanja.
- **Popravljeno:** `start_url` je postavljen na `"/"` u `app/manifest.ts`, tako da je uvijek same-origin. Uklonjena je ovisnost o `getSiteUrl()` u manifestu.

---

## 3. Klikovi i navigacija koje su provjerene

### Header linkovi (PublicHeader)
- Početna → `/`  
- Kategorije → `/categories`  
- Kako radi → `/#kako-radi`  
- Postani majstor → `/register`  
- Prijava → `/login`  
Svi rade.

### PremiumMobileHeader (dashboard, request create, itd.)
- Desktop: Kategorije, Kako radi, Admin (ako admin), avatar/dashboard link, Prijava/Registracija.  
- Mobilni meni (prijavljen): Kategorije, Kako radi, Admin panel (ako admin), **Moj dashboard**, **Odjavi se**.  
- Mobilni meni (neprijavljen): Kategorije, Kako radi, Prijava, Registracija.  
Svi relevantni klikovi provjereni u kodu i ispravljeni (dodani dashboard + odjava).

### Admin sidebar
- Svi NAV_ITEMS vode na /admin, /admin/moderation, /admin/handymen, … /admin/audit.  
- Linkovi se filtriraju po `hasPermission(adminRole, permission)`.  
Nema broken linkova.

### CTA dugmad
- "Objavi zahtjev" (StickyBottomCTA, hero, category, grad) → `/request/create` (ili sa query category/city).  
- "Novi zahtjev" na dashboard/user → `/request/create`.  
- "Pogledaj" na kartici zahtjeva (user dashboard) → `/request/[id]`.  
- Handyman request list "Pogledaj zahtjev" → `/request/[id]`.  
Svi koriste ispravne putanje.

### Auth
- Login: LoginForm → signIn(credentials, redirect: false), zatim router.push(callbackUrl), router.refresh().  
- Register: RegisterForm, defaultRole iz ?type=majstor.  
- Logout: SiteHeader i MobileNav koriste signOut({ callbackUrl: "/" }); admin layout koristi form action="/api/auth/signout".  
Redirecti: login/register redirect na "/" ako već postoji session; dashboard stranice redirect na /login ako nema session, na "/" ako role nije odgovarajući.

---

## 4. Šta nije radilo (prije popravki)

1. **Mobilni meni za prijavljene korisnike** – Nije bilo načina da se iz mobilnog header-a dođe na "Moj dashboard" ili "Odjavi se"; samo Kategorije i Kako radi (i Admin za admine).  
2. **PWA start_url** – U nekim okruženjima mogao je biti cross-origin i izazivati upozorenja ili loše ponašanje instalirane PWA.

---

## 5. Šta je popravljeno (sažetak)

| Fajl | Promjena |
|------|----------|
| `components/layout/PremiumMobileHeader.tsx` | U mobilnom meniju za prijavljene korisnike dodani link "Moj dashboard" (prema roli) i form "Odjavi se". Desktop nav: `<a>` zamijenjen sa `<Link>` za /categories i /#kako-radi. |
| `app/manifest.ts` | `start_url` postavljen na `"/"`; uklonjen import i korištenje `getSiteUrl()`. |

---

## 6. Login, admin, request flow, handyman flow – stanje

- **Login:** Stranica /login se učitava; ako je session, redirect na "/". LoginForm šalje credentials na API, na uspjeh radi router.push(callbackUrl) i router.refresh(). callbackUrl iz query-a (npr. /admin) se koristi. SessionProvider je dostupan u layoutima koji koriste PremiumMobileHeader (dashboard, request), tako da nakon logina na tim stranicama session na klijentu radi.
- **Admin:** requireAdmin (bez cache nakon emergency fixa) i requireAdminPermission provjeravaju session i role; redirect na /login?callbackUrl=/admin ako nema session. Dashboard učitava podatke direktno (bez unstable_cache). Admin sidebar linkovi vode na sve sekcije; permisije filtriraju vidljive stavke.
- **Request flow:** Create zahtjeva (guest ili user) na /request/create; submit na /api/requests; na uspjeh redirect na /request/[id] sa tokenom. Request detail stranica prikazuje ponude, chat, unlock kontakt; ownership po userId ili requesterToken. Linkovi sa user dashboarda i handyman request liste vode na ispravan /request/[id].
- **Handyman flow:** Dashboard za HANDYMAN na /dashboard/handyman; zahtjevi s linkom na /request/[id]; profil i krediti zaštićeni; slanje ponude i otključavanje kontakta kroz postojeće komponente i API-je.

---

## 7. Glavni CTA linkovi – stanje

- Početna → Objavi zahtjev: StickyBottomCTA i hero CTA vode na /request/create.  
- Kategorije / grad / handyman profil → Objavi zahtjev: linkovi sa category, city ili handyman parametrima gdje je potrebno.  
- Header Prijava/Registracija: rade.  
- Dashboard "Novi zahtjev" / "Objavi zahtjev": rade.  
- Admin sidebar: svi linkovi rade i poštuju permisije.  
- Request detail "Prijavi se" (ako nisi vlasnik): vodi na /login?callbackUrl=/request/[id].

---

## 8. Preostale poznate greške

- Nema kritičnih grešaka koje su u ovom audit-u identificirane a nisu popravljene.  
- Ako korisnik nakon logina ode na homepage (/), koristi se PublicHeader koji ne prikazuje stanje sesije (namjerno radi performansi); da vidi "Moj dashboard" ili odjavu, mora otići na stranicu koja koristi PremiumMobileHeader (npr. /request/create ili /dashboard) ili ponovo kliknuti Prijavu pa će biti redirectan. To je trenutni dizajn.

---

## 9. Sitnice / preporuke (nekritično)

- **SessionProvider na rootu:** Root layout ne uključuje Providers (SessionProvider). Login i register rade; nakon logina, na stranicama bez Providers (npr. /) klijent nema session context dok korisnik ne ode na dashboard/request/admin. Ako želiš da i homepage odmah prikaže stanje prijave, možeš u root layout umotati children u `<Providers>` – uz napomenu da to učitava SessionProvider na svim stranicama.  
- **Admin /admin/reports:** Ruta postoji i radi redirect na /admin/moderation; nema broken linkova jer sidebar ne vodi na /admin/reports.  
- **Copy:** Prethodno je ispravljen copy u WhyMajstorSection (besplatno za korisnike); FAQ i ostali javni tekstovi su provjereni u prethodnim zadacima.

---

## 10. Error logging

- Admin dashboard već ima try/catch oko auth i loadDashboardData sa logovanjem `[AdminDashboard] Auth error` i `[AdminDashboard] Data load error` (dodano u emergency fixu).  
- Ostale rute koriste redirect(), notFound() ili standardno ponašanje Next.js; nije dodavano dodatno logovanje u ovom QA krugu.

---

## 11. PWA / manifest

- **manifest.ts:** start_url = "/" (same-origin).  
- Icons / display / theme_color ostaju kao prije.  
- Service worker / PWA instalacija nije posebno testirana u okviru ovog audita; konfiguracija manifesta je usklađena sa preporukom za same-origin start_url.

---

## 12. Zaključak

- **Provjerene:** sve glavne rute (javne, dashboard, admin), auth flow, request flow, handyman flow, header linkovi, CTA-ovi, admin sidebar, redirecti.  
- **Popravljeno:** (1) mobilni meni za prijavljene korisnike (Moj dashboard + Odjavi se) u PremiumMobileHeader, (2) manifest start_url na "/".  
- **Stanje:** Login, admin, request flow i handyman flow rade; glavni CTA linkovi vode na ispravne stranice; nema preostalih kritičnih grešaka identificiranih u ovom audit-u.

---

*Kraj izvještaja – Full QA + Route Audit.*
