# HITNI FIX — IMAGE UPLOAD NE SMIJE DA FORSIRA KAMERU

## 1. Nađen uzrok

- **`capture="environment"`** na skrivenim `<input type="file">` — na mobilnim browserima to nalaže direktan ulaz u kameru (stražnja), umjesto uobičajenog pickera (galerija / fajl).
- Pogođeno **3** komponente (sve instance `type="file"` u repou).

## 2. Šta je promijenjeno

- Uklonjen je **`capture="environment"`**; ostavljen **`accept="image/jpeg,image/png,image/webp"`** i ostala logika bez izmjena.

## 3. Izmijenjeni fajlovi

- `components/profile/avatar-upload.tsx` — majstor/korisnik avatar
- `components/profile/gallery-editor.tsx` — galerija profila majstora
- `components/forms/request-photos-editor.tsx` — fotografije na kreiranju zahtjeva

## 4. Runtime / build potvrda

- `npx tsc --noEmit` — **PASS**
- `npx next build` — **PASS**

## 5. Rizici / napomena

- Ponašanje pickera i dalje zavisi od **OS/browsera**; bez `capture`, korisnik obično dobije izbor (galerija, fajlovi, ponekad kamera).
- Ručno na **pravom telefonu** (iOS/Android) potvrditi jedan tok po želji.

## 6. Završni status

- **ISPRAVLJENO** (u kodu — svi poznati `capture` uklonjeni; build prolazi).
