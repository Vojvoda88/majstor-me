# Majstor.me – Test Runbook

Tačni koraci za ručno testiranje cijelog flow-a.

---

## Preduslov

1. Pokrenuti `npm run db:push`
2. Opciono: `npm run db:seed` za demo podatke
3. Pokrenuti `npm run dev`
4. Otvoriti http://localhost:3000

---

## Flow 1: Registracija korisnika

1. Idite na **/** → klik **Registracija**
2. Izaberite **Korisnik (tražim majstora)**
3. Unesite: Ime, Email, Lozinka (min 6 karaktera)
4. Klik **Registruj se**
5. **Očekivano:** Redirect na `/request/create`

---

## Flow 2: Kreiranje zahtjeva

1. Kao prijavljeni korisnik, idite na **Novi zahtjev** ili `/request/create`
2. Izaberite kategoriju: npr. **Vodoinstalater**
3. Unesite opis (min 10 karaktera): npr. "Pukla cijev u kupatilu"
4. Grad: **Nikšić**
5. Hitnost: npr. **Hitno danas**
6. Klik **Objavi zahtjev**
7. **Očekivano:** Redirect na detalj stranicu zahtjeva

---

## Flow 3: Prijava kao majstor

1. Odjavite se (ako ste prijavljeni)
2. **Prijava** → unesite npr. majstor.vodoinstalater@test.me / Test123!
3. **Očekivano:** Redirect na `/dashboard/handyman`
4. Ako nema profila: ažurirajte kategorije i gradove na `/dashboard/handyman/profile`

---

## Flow 4: Slanje ponude

1. Kao majstor, idite na **Dashboard majstora**
2. Kliknite na jedan otvoreni zahtjev
3. U sekciji **Pošalji ponudu** unesite:
   - Tip cijene: npr. **Fiksna cijena**
   - Cijena: npr. 50
   - Poruka (opciono)
4. Klik **Pošalji ponudu**
5. **Očekivano:** Ponuda se pojavljuje u listi, forma se resetuje

---

## Flow 5: Prijava kao korisnik i prihvatanje ponude

1. Odjavite se
2. Prijavite se kao korisnik (npr. marko@test.me / Test123!)
3. Idite na **Moji zahtjevi** ili direktno na detalj zahtjeva
4. U listi ponuda klik **Prihvati ponudu** na željenoj ponudi
5. **Očekivano:** Ponuda prihvaćena, ostale odbijene, status zahtjeva: **U toku**

---

## Flow 6: Označavanje posla završenim

1. Kao korisnik, na stranici zahtjeva u toku
2. U sekciji **Prihvaćena ponuda** klik **Označi posao završenim**
3. **Očekivano:** Status: **Završen**, pojavljuje se forma za recenziju

---

## Flow 7: Ostavljanje recenzije

1. Kao korisnik, na završenom zahtjevu
2. U formi **Ostavite recenziju** izaberite ocjenu (1–5) i opciono komentar
3. Klik **Ostavite recenziju**
4. **Očekivano:** Recenzija sačuvana, majstorov rating ažuriran

---

## Flow 8: Prijava kao admin

1. Odjavite se
2. Prijavite se: admin@majstor.me / Test123!
3. Klik **Admin** u navigaciji
4. **Očekivano:** Pristup admin dashboardu

---

## Flow 9: Admin – verifikacija majstora

1. Kao admin, idite na **Majstori**
2. Nađite majstora sa statusom **PENDING**
3. Klik **Verifikuj**
4. **Očekivano:** Status se mijenja u **VERIFIED**

---

## Flow 10: Admin – pregled metrika

1. Na admin dashboardu provjerite:
   - Ukupno korisnika
   - Ukupno majstora
   - Aktivni zahtjevi
   - Otvoreni zahtjevi
   - Završeni poslovi
   - Otvorene prijave
2. Klik na kartice za navigaciju na liste

---

## Brzi E2E (bez seed-a)

Ako nemate seed podatke:

1. Registrujte se kao **Korisnik** → kreirajte zahtjev
2. Odjavite se → registrujte se kao **Majstor**
3. Ažurirajte profil (kategorije, grad)
4. Pošaljite ponudu na zahtjev
5. Odjavite se → prijavite se kao korisnik
6. Prihvatite ponudu → označite završeno → ostavite recenziju

---

*Za admin pristup: kreirajte nalog, zatim u bazi postavite `role = 'ADMIN'` ili pokrenite seed.*
