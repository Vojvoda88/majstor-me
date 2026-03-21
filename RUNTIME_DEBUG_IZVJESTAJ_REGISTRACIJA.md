# RUNTIME DEBUG IZVJEŠTAJ — REGISTRACIJA STVARNO TESTIRANA

**Datum testa (runtime):** 2026-03-21  
**Okruženje:** Windows, `npx next dev -p 3010`, projekat `MajstorMe`, učitava se `.env`.

---

## 1. Pokretanje aplikacije

| Stavka | Dokaz |
|--------|--------|
| Server podignut | Da — `next dev` na **http://localhost:3010**, log: `✓ Ready in 2.3s` |
| Runtime radio | Da — HTTP odgovori na `POST /api/auth/register` |
| Baza dostupna | Da — `PrismaClient` uspješno pročitao kreirane redove nakon registracije |

**Napomena:** Port **3000** je bio zauzet (`EADDRINUSE` u ranijem testu); server je pokrenut na **3010** da bi test prošao bez konflikta.

---

## 2. Test USER registracije

| Polje | Vrijednost |
|-------|--------------|
| **Ruta** | `POST http://localhost:3010/api/auth/register` |
| **Payload** | `{"name":"Runtime User Test","email":"rt-user-20260321101345@runtime-test.local","password":"TestPass123456","role":"USER"}` |
| **Response status** | **200** |
| **Response body** | `{"success":true,"data":{"id":"cmn0428ps000111l926szppom","name":"Runtime User Test","email":"rt-user-20260321101345@runtime-test.local","role":"USER","createdAt":"2026-03-21T09:13:46.912Z"}}` |
| **Rezultat u bazi** | `Prisma user.findUnique` + `handymanProfile`: `email` i `role` USER, **nema** `handymanProfile` (očekivano) |

**Alat:** `Invoke-WebRequest` (PowerShell) sa `Content-Type: application/json; charset=utf-8`.

---

## 3. Test HANDYMAN registracije

| Polje | Vrijednost |
|-------|--------------|
| **Ruta** | `POST http://localhost:3010/api/auth/register` |
| **Payload** | `{"name":"Runtime Handyman Test","email":"rt-hm-20260321101407@runtime-test.local","password":"TestPass123456","role":"HANDYMAN"}` |
| **Response status** | **200** |
| **Response body** | `{"success":true,"data":{"id":"cmn042p5e000311l9ws3yj3eu","name":"Runtime Handyman Test","email":"rt-hm-20260321101407@runtime-test.local","role":"HANDYMAN","createdAt":"2026-03-21T09:14:08.210Z"}}` |
| **User u bazi** | Postoji, `role: HANDYMAN` |
| **Handyman profil u bazi** | Postoji: `handymanProfileId: cmn042p8g000511l9orxeqa74`, `citiesLen: 0` |

**Dokaz iz baze (izlaz skripte):**

```
USER_ROW: {"email":"rt-user-20260321101345@runtime-test.local","role":"USER","handymanProfile":"none"}
HANDYMAN_ROW: {"email":"rt-hm-20260321101407@runtime-test.local","role":"HANDYMAN","handymanProfileId":"cmn042p8g000511l9orxeqa74","citiesLen":0}
```

**Skripta:** `npx tsx scripts/runtime-verify-reg.ts <userId> <handymanUserId>`

---

## 4. Negativni slučaj (dupli email)

| Polje | Vrijednost |
|-------|--------------|
| **Payload** | Isti email kao postojeći USER (`rt-user-20260321101345@runtime-test.local`) |
| **Response status** | **400** |
| **Response body** | `{"success":false,"error":"Korisnik sa ovim email-om već postoji","code":"EMAIL_ALREADY_EXISTS"}` |

**Alat:** `curl.exe` sa JSON iz temp fajla (radi ispravnog escapinga u Windows okruženju).

---

## 5. Login poslije registracije (NextAuth)

Pokušaj: `POST /api/auth/callback/credentials` sa `csrfToken` sa istog hosta (`localhost:3010`).

**Odgovor:** HTTP 200, body: `{"url":"http://localhost:3000/api/auth/signin?csrf=true"}`

**Objašnjenje (uzrok, ne nagađanje):** U `.env` je **`NEXTAUTH_URL=http://localhost:3000`**, dok je dev server testiran na **`http://localhost:3010`**. NextAuth očekuje kolačiće / CSRF za URL iz `NEXTAUTH_URL`; neslaganje hosta/porta tipično vodi na redirect na sign-in stranicu umjesto uspješne sesije.

**Zaključak za ovaj izvještaj:**

- **Registracija i upis u bazu (USER + HANDYMAN + profil)** — **dokazano radi** runtime zahtjevima i Prisma čitanjem.
- **Login kroz `/api/auth/callback/credentials` na portu 3010** — u ovom testu **nije** potvrđen kao uspješan zbog **NEXTAUTH_URL vs port**; to **nije** greška u `POST /api/auth/register`.

**Preporuka za lokalni login test:** pokrenuti `next dev` na portu **3000** (ili postaviti `NEXTAUTH_URL` na isti port kao dev server, npr. `http://localhost:3010`).

---

## 6. Šta je puklo tokom testa

- **curl `-d` sa ručnim JSON-om u PowerShellu** — vratilo `Neispravan zahtjev (JSON).` — **uzrok:** pogrešno escaping znakova u shellu, ne API.

---

## 7. Izmijenjeni / dodati fajlovi u ovom koraku

- `scripts/runtime-verify-reg.ts` — **novo:** mali runtime dokaz čitanja iz baze (može se obrisati ako ne želite alat u repou).

**Nema izmjena** u `app/api/auth/register` — registracija je već prošla bez izmjene koda.

---

## 8. Finalna potvrda

**USER i HANDYMAN registracija (API + baza) sada rade** — **dokazano** stvarnim HTTP 200 odgovorima i Prisma potvrdom redova u bazi.

Login preko NextAuth na **istom portu kao NEXTAUTH_URL** nije u ovom run-u eksplicitno potvrđen; preporuka je uskladiti port ili `NEXTAUTH_URL`.

---

## 9. Self-check

- [x] Server stvarno pokrenut (`next dev -p 3010`)
- [x] Runtime request stvarno poslat (`Invoke-WebRequest` / `curl`)
- [x] USER stvarno testiran (200 + DB)
- [x] HANDYMAN stvarno testiran (200 + DB + handyman_profiles)
- [x] Upis u bazu potvrđen (`tsx scripts/runtime-verify-reg.ts`)
- [x] Dupli email: 400 + `EMAIL_ALREADY_EXISTS`
- [x] Nema nagađanja za registraciju — postoje status + body + DB izlaz

---

## 10. Test korisnici u bazi

Test emailovi (`@runtime-test.local`) ostaju u bazi dok ih ne obrišeš ručno (admin / SQL). ID-evi iz ovog testa:

- USER: `cmn0428ps000111l926szppom`
- HANDYMAN user: `cmn042p5e000311l9ws3yj3eu`
