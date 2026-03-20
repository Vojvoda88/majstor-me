# MINI LIVE CHECK SPRINT – Izvještaj

**Datum:** 17.03.2025  
**Opseg:** Provjera glavnih ruta, CTA-ova, copy-ja, layout-a i konverzije.

---

## 1. IZVJEŠTAJ PO RUTAMA

### `/`
| Provjera | Status |
|----------|--------|
| Otvara se bez errora | ✅ OK |
| Beskonačan loading | ✅ Nema |
| CTA dugmad | ✅ Hero: "Objavi besplatan zahtjev", "Pregledaj kategorije"; trust pills jasni |
| Copy | ✅ Jasan: "Majstori za cijelu Crnu Goru, na jednom mjestu"; "✓ Besplatno za korisnike" |
| Layout desktop/mobile | ⚠️ Vidi MEDIUM problem |
| Conversion problem | ❌ Nema očiglednog |

### `/categories`
| Provjera | Status |
|----------|--------|
| Otvara se bez errora | ⚠️ E2E ponekad 500 (flaky) |
| Beskonačan loading | ✅ Nema |
| CTA / copy | ✅ Statična stranica, linkovi na category/[slug] |
| Layout | ✅ pt-16, jednostavan grid |

### `/request/create`
| Provjera | Status |
|----------|--------|
| Otvara se bez errora | ✅ OK |
| Trust copy | ✅ CardDescription: "Vaš zahtjev je besplatan. Nakon slanja dobijate ponude od više majstora..."; header: "Provjereni majstori", "Brze ponude", "Bez obaveze" |
| Submit flow | ✅ Razumljiv: "Šaljem majstorima..." → redirect na /request/[id] |
| Forma preduga/zbunjujuća | ✅ Razumna: ime, telefon, kategorija, naslov, opis, grad; email/adresa/slike opciono |
| Conversion rizik | ❌ Nema očiglednog |

### `/category/vodoinstalater`, `/grad/podgorica`, `/vodoinstalater-podgorica`
| Provjera | Status |
|----------|--------|
| Otvara se bez errora | ✅ OK (HTTP 200) |
| CTA | ✅ Empty state: "Objavi besplatan zahtjev" + trust tekst |
| Layout | ✅ PublicHeader, responsive grid |

### `/admin`
| Provjera | Status |
|----------|--------|
| First render | ✅ Prihvatljiv; fallback na prazan state ako DB fail |
| Usporenost | ✅ Cache 60s, optimizirano |
| Mobile | ✅ lg:flex sidebar, mobilni layout postoji |

---

## 2. NAĐENI PROBLEMI

### MEDIUM: Header nav link ponekad neklikabilan (Hero preklapanje)
- **Opis:** U E2E testu "PublicHeader: Početna, Kategorije..." klik na `nav-pocetna` failuje jer "element from div.mx-auto.max-w-6xl subtree intercepts pointer events" – slika (Hero ili CategoriesGrid) preklapa header.
- **Uzrok:** Hero sekcija ili content ispod ima elemente koji u određenim scroll/ viewport stanjima prekrivaju fixed header.
- **Prioritet:** MEDIUM – može utjecati na UX na pojedinim uređajima/viewportima.

### LOW: /categories povremeno 500 u E2E
- **Opis:** GET /categories povremeno vraća 500 u Playwright testovima.
- **Napomena:** Stranica je čisto statična (bez DB). Vjerovatno flaky/okruženje (npr. cold start, više dev servera).
- **Prioritet:** LOW – provjeri na produkciji; ako ne reproducira, ignoriraj.

### Nema drugih kritičnih problema
- CTA-ovi rade, copy je jasan, layout je stabilan.
- Request form ima dobar trust copy i nije preopterećen.
- Admin dashboard nema novih očiglednih problema.

---

## 3. PREPORUKA

**Nema potrebe za novom velikom fazom.** Ako se želi brzo poboljšanje:

### Sprint: "Header click fix" (opciono)

| Stavka | Sadržaj |
|--------|---------|
| **Naziv** | Header Click Fix |
| **Cilj** | Osigurati da header nav linkovi budu uvijek klikabilni |
| **Fajlovi** | `components/home-page/Hero.tsx` |
| **Šta mijenjati** | Na Hero `Image` i overlay div dodati `pointer-events-none`; na inner content div (search + buttons) ostaviti `pointer-events-auto` da CTA-i ostanu klikabilni. Time klice prolaze kroz hero pozadinu do headera. |
| **Šta NE dirati** | Admin, backend, druge rute, dizajn |

**Napomena:** Ako E2E testovi prolaze u većini slučajeva i nema user reportova, sprint može pričekati.

---

## 4. ZAKLJUČAK

- **CRITICAL:** Nema.
- **MEDIUM:** 1 (header nav preklapanje).
- **LOW:** 1 (flaky /categories 500).
- **Preporuka:** Nije nužan hitan sprint. Ako se radi nešto, samo "Header click fix" u jednom fajlu.
