# HOMEPAGE / HOW IT WORKS / MAJSTORSKI CTA — IZVJEŠTAJ

## 1. Pregledano trenutno stanje

- `HowItWorks` je objedinjavala oba auditorijuma; ispod je bio zajednički CTA red; `CTAForMasters` je bio na dnu stranice poslije FAQ/SEO linkova.
- Redoslijed: How it works → kategorije → … → CTA majstori na kraju (suprotno od traženog).
- Hero: primarni CTA za korisnika + „Pregled kategorija“; majstor link kao sitan tekst na dnu.

## 2. Šta je tačno promijenjeno

- **Redoslijed:** Hero (zona sa StatsStrip + HomeConversionBand) → **Kako radi za korisnike** → **Kako radi za majstore** → **Majstorski CTA** → **Kategorije** → ostalo (recenzije, zašto, FAQ, SEO).
- **Hero:** dual-entry — primarni „Objavi besplatan zahtjev“, sekundarni link na `/#kako-radi-majstore`; „Pregled kategorija“ kao diskretniji treći red; zadržan link za brzu registraciju majstora.
- **Korisnici:** 3 koraka (objava → javljaju se majstori → uporedite), bez kredita i sistemske logike.
- **Majstori:** novi narodski copy u 6 koraka + blok „Krediti ukratko“ (`#majstor-krediti`) sa modelom 1 cent, paketima i hitnošću 200/300/400.
- **CTA majstori:** jači naslov, čipovi (1 kredit = 1 cent, ponuda &lt; 2 €, bez članarine), primarni „Registruj se kao majstor“, sekundarni „Kako rade krediti“ → `#majstor-krediti`.
- **Vizuelno:** svjetliji wrapperi, manja „težina“ senki, više vazduha na karticama.

## 3. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|--------|-----|--------|
| `app/page.tsx` | Dva exporta sekcija + CTA prije `CategoriesGrid`; uklonjen dupli CTA na dnu | Traženi redoslijed konverzije |
| `components/home-page/HowItWorks.tsx` | `HowItWorksForUsers`, `HowItWorksForHandymen`; novi copy; `id="kako-radi"` na korisničkoj sekciji (nav link); `#majstor-krediti` | Jasnoća, anchori, kreditni sažetak |
| `components/home-page/CTAForMasters.tsx` | Jači CTA, dva dugmeta, čipovi | Prodaja + sekundarni ulaz |
| `components/home-page/Hero.tsx` | Sekundarni CTA za majstore na `#kako-radi-majstore`; kategorije ispod | Dual-entry bez pretrpavanja |

## 4. Novi redoslijed homepage sekcija

1. Hero (+ StatsStrip + HomeConversionBand u hero zoni)  
2. Kako radi za korisnike (`#kako-radi`)  
3. Kako radi za majstore (`#kako-radi-majstore`)  
4. Majstorski CTA blok  
5. Kategorije (6 + link ka svima)  
6. Recenzije → Zašto → FAQ → SEO linkovi  

## 5. Finalni copy za „Kako radi za majstore“

**Podnaslov ispod naslova (u UI):**  
„Bez pretplate. Start sa 1000 kredita. Plaćate samo kad želite da konkurišete za posao koji vam odgovara.“

**Koraci (naslovi + opisi kako u kodu):**

1. **Upišete se bez naknade** — Napravite profil, izaberite šta radite i gdje radite. Nema pretplate — ne plaćate mjesečno da biste bili na platformi.  
2. **1000 kredita za početak** — Na račun stigne 1000 kredita za početak. Računamo jednostavno: 1 kredit = 1 cent u ponudi paketa. To vam obično pokrije prvih 5 standardnih konkurisanja (standardni posao = 200 kredita; hitnije oglase 300 ili 400).  
3. **Obavještenja koja vama imaju smisla** — Dobićete obavještenja za poslove koje želite da radite — u gradovima i područjima koja sami odaberete, ne samo u jednom mjestu.  
4. **Prvo pogledate posao, pa odlučite** — Opis i slike vidite besplatno. Kad vam posao legne i imate vremena, tek onda ulazite u kontakt — ne prije.  
5. **Kad hoćete da konkurišete, potvrdite kontakt** — Tek kad potvrdite, jednom se skinu krediti za taj posao — za standardni obično 200 kredita: možete poslati ponudu za manje od 2 € u tom smislu. Tek tada vidite broj i javljate se korisniku. Bez potvrde kontakta ne šaljete ponudu.  
6. **Zatim ponuda ili poziv** — Kada imate kontakt, šaljete ponudu kroz formu ili odmah zovete / pišete — kako vama odgovara. Plaćate samo onaj posao za koji ste odlučili da konkurišete.

**Blok „Krediti ukratko“:**  
1 kredit = 1 cent u ponudi paketa (9,99 € = 1000; 24,99 € = 3000; 49,99 € = 6500). Hitnost: nije hitno / fleksibilno 200, hitno 300, hitno danas 400 — prije potvrde kontakta uvijek vidite tačan iznos.

## 6. Runtime potvrda

| Stavka | Rezultat |
|--------|----------|
| How it works za korisnike | **PASS** |
| How it works za majstore | **PASS** |
| Majstorski CTA | **PASS** |
| Kategorije pomjerene ispod | **PASS** |
| Kartice posvijetljene / čitljivije | **PASS** |

(`npm run build` — uspješan)

## 7. Tačni problemi ako ih još ima

- Nema poznatih blokada u kodu. Anchor `#majstor-krediti` je ispod sekcije majstora — radi na istoj stranici.

## 8. Završni status

**HOMEPAGE I MAJSTORSKI HOW IT WORKS SU USPJEŠNO ZATEGNUTI**
