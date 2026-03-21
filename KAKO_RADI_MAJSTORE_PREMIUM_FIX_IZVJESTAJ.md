# KAKO RADI ZA MAJSTORE — PREMIUM FIX IZVJEŠTAJ

## 1. Šta je tačno promijenjeno

- Ugrađen **finalni copy** za naslov, podnaslov, svih 5 kartica i završnu poruku (prema specifikaciji).
- **Uklonjen** žuti/amber wrapper (`handymanWrap`) i zamijenjen **svijetlom** sekcijskom pozadinom (`slate-50/40` → bijelo, suptilan `border-t`).
- **Nova komponenta** za majstorske kartice (`HandymanStepGrid` / `HandymanStepGridMobile`) — drugačiji stil od korisničkog `StepGrid`; **kartica 2** („1000 kredita za početak“) vizuelno **istaknuta** (tamnija ikona, jača sjena, tanka gornja traka, oznaka „Glavni benefit“).
- **Uklonjen** stari blok „Krediti ukratko“ sa dugim tehničkim tekstom; **1 kredit = 1 cent** je u **podnaslovu**; završna poruka ispod kartica + `id="majstor-krediti"` za postojeći anchor (npr. CTA „Kako rade krediti“).
- Ikona za karticu 3: **Smartphone** (naglasak na telefonu za obavještenja).

## 2. Izmijenjeni fajlovi

| Putanja | Šta | Zašto |
|--------|-----|--------|
| `components/home-page/HowItWorks.tsx` | `HANDYMAN_STEPS` copy; `HandymanStepGrid*`; sekcija `HowItWorksForHandymen` (pozadina, podnaslov, bez amber wrappera); uklonjen stari „Krediti ukratko“ blok | Samo majstorska sekcija, premium izgled, tačan tekst |

## 3. Finalni tekst koji je ugrađen

- **Naslov:** Kako radi za majstore  
- **Podnaslov:** Napravite profil besplatno, dobijate 1000 kredita za početak i birajte poslove koji vam odgovaraju.  
- **Linija ispod:** 1 kredit = 1 cent.  
- **Kartica 1:** Napravite profil besplatno — Registracija je potpuno besplatna. Nema pretplate i nema mjesečnih troškova.  
- **Kartica 2 (istaknuta):** 1000 kredita za početak — Dobijate 1000 kredita odmah nakon registracije. To vam je dovoljno za prvih 5 standardnih ponuda.  
- **Kartica 3:** ODMAH dobijate obavještenje kada se pojavi posao za vas — … obavještenje na telefonu …  
- **Kartica 4:** Posao prvo pogledate besplatno — …  
- **Kartica 5:** Kad vam odgovara, otključate kontakt i šaljete ponudu — …  
- **Ispod kartica:** Bez pretplate. Plaćate samo kada želite da konkurišete za posao.

## 4. Vizuelne promjene kartica

- Standardne kartice: bijela pozadina, suptilan border, blaga sjena, blagi hover.
- **Featured** kartica: jača sjena, tanka **slate** gornja traka, oznaka „Glavni benefit“, ikona na **slate-900** pozadini, veći naslov.
- Sekcija: više vazduha (`py-12` / `md:py-20`), bez žutog okvira; suptilan gornji border sekcije.

## 5. Runtime potvrda

| Stavka | Rezultat |
|--------|----------|
| Novi copy | **PASS** |
| 1 kredit = 1 cent vidljivo | **PASS** |
| 1000 kredita kartica istaknuta | **PASS** |
| Žuti okvir uklonjen | **PASS** |
| Sekcija premium i čišće | **PASS** |

(`npx tsc --noEmit` — **PASS**)

## 6. Tačni problemi ako ih još ima

- Nema poznatih blokada u kodu.

## 7. Završni status

**KAKO RADI ZA MAJSTORE JE SADA PREMIUM I JASNO**
