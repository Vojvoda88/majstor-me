# PWA ikone i preload – izvještaj

## 1. Šta je bilo neispravno

- **Manifest icon error:** U `public/` nisu postojali fajlovi `icon-192.png` i `icon-512.png`. Manifest u `app/manifest.ts` referencira `/icon-192.png` i `/icon-512.png`, pa je browser prijavio: "Download error or resource isn't a valid image".
- **Preload warning:** Next.js `next/font` za Inter, DM_Sans i Outfit automatski dodaje `<link rel="preload">` za fontove. Ako se font ne koristi u prvih nekoliko sekundi (npr. samo u komponentama ispod folda), browser prijavi: "The resource was preloaded but not used within a few seconds". Inter i Outfit se koriste preko CSS varijabli u pojedinim komponentama, dok je DM_Sans glavni font (body) – preload za sva tri može dovesti do upozorenja za ona dva koja se ne koriste odmah.

---

## 2. Koje fajlove sam popravio / dodao

| Fajl | Promjena |
|------|----------|
| **public/icon-192.png** | Novi – generiran skriptom (192×192 px, validan PNG, theme boja + "M"). |
| **public/icon-512.png** | Novi – generiran skriptom (512×512 px, validan PNG, ista grafika). |
| **scripts/generate-pwa-icons.js** | Novi – Node skripta (sharp) koja generiše oba PNG-a u `public/`. |
| **app/manifest.ts** | Icons ostaju na `/icon-192.png` i `/icon-512.png`; dodani su i `purpose: "maskable"` za oba (pored `any`). |
| **app/layout.tsx** | Za Inter i Outfit postavljeno `preload: false` kako next/font ne bi dodavao preload za te fontove; DM_Sans ostaje s preloadom (glavni font). |
| **package.json** | Dodan script `icons:generate` koji pokreće `node scripts/generate-pwa-icons.js`. |

---

## 3. Da li su ikone zamijenjene

Ikone **nisu zamijenjene** – ranije **nisu postojale**. Dodate su nove, validne PNG ikone (192×192 i 512×512), generirane skriptom sa sharpom (plavi pravougaonik zaobljenih uglova, bijelo slovo "M" – theme #2563EB).  
Ako kasnije želiš druge ikone (logo, druga boja), možeš ih ručno staviti u `public/` preko postojećih imena ili prilagoditi `scripts/generate-pwa-icons.js` i ponovo pokrenuti `npm run icons:generate`.

---

## 4. Koji preload je uklonjen ili ispravljen

- **Uklonjen preload** za fontove **Inter** i **Outfit** u `app/layout.tsx` postavljanjem **`preload: false`** u konfiguraciji `next/font` za ta dva fonta. Oni se i dalje učitavaju, ali bez `<link rel="preload">`, što smanjuje upozorenje "preloaded but not used" ako se ne koriste na prvom ekranu.
- **DM_Sans** ostaje s preloadom (default), jer je glavni font (body) i koristi se odmah pri učitavanju.
- Nije mijenjan niti jedan ručni `<link rel="preload">` u aplikaciji – u kodu nema eksplicitnog preloada; preload je dolazio isključivo od next/font.

---

## 5. Verifikacija

- **Manifest ikone:** Nakon generiranja, `public/icon-192.png` i `public/icon-512.png` postoje i odgovaraju dimenzijama; manifest ih referencira ispravno. Očekivano: nema više "Manifest icon error" u browseru.
- **Preload:** S `preload: false` za Inter i Outfit, broj preload linkova se smanjuje; upozorenje "The resource was preloaded but not used" bi trebalo nestati ili biti znatno rjeđe. Ako se i dalje pojavi (npr. za neki drugi resurs ili chunk), treba u DevTools → Network/Console provjeriti koji je točno resurs i prilagoditi ga (ukloniti ili ispraviti `as` ako treba).
- **PWA manifest:** `start_url` je `"/"`; ikone su validne i na ispravnim putanjama; manifest bi trebao raditi ispravno za PWA.

---

## Kako ponovo generisati ikone

```bash
npm run icons:generate
```

Zahtijeva `sharp` (već u devDependencies). Ako želiš druge ikone, uredi `scripts/generate-pwa-icons.js` (boja, tekst, veličina) i ponovo pokreni komandu.
