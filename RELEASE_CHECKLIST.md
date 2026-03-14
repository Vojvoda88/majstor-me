# Majstor.me – Release Checklist

Finalne provjere prije pokretanja za prve korisnike.

---

## Okruženje

- [ ] `DATABASE_URL` postavljen (Supabase transaction pooler, port 6543)
- [ ] `DIRECT_DATABASE_URL` postavljen (Supabase session pooler, port 5432)
- [ ] `NEXTAUTH_URL` postavljen na production URL (bez trailing slash)
- [ ] `NEXTAUTH_SECRET` generisan (`openssl rand -base64 32`)
- [ ] Opciono: `RESEND_API_KEY` i `EMAIL_FROM` (app radi i bez njih)

---

## Baza podataka

- [ ] `npx prisma db push` uspješno izvršen
- [ ] Tabele postoje u Supabase (users, requests, offers, itd.)
- [ ] Opciono: `npm run db:seed` izvršen za demo podatke

---

## Autentifikacija

- [ ] Registracija radi (korisnik i majstor)
- [ ] Prijava radi
- [ ] Odjava radi
- [ ] Redirect nakon prijave ispravan (dashboard prema ulozi)
- [ ] Session traje nakon refresh stranice

---

## Flow zahtjeva

- [ ] Korisnik može kreirati zahtjev
- [ ] Zahtjev se prikazuje u listi
- [ ] Detalj zahtjeva se učitava bez greške

---

## Flow ponuda

- [ ] Majstor vidi otvorene zahtjeve
- [ ] Majstor može poslati ponudu
- [ ] Korisnik vidi ponude
- [ ] Korisnik može prihvatiti ponudu
- [ ] Status se mijenja na "U toku"

---

## Flow završetka i recenzija

- [ ] Korisnik može označiti posao završenim
- [ ] Korisnik može ostaviti recenziju (1–5, komentar)
- [ ] Recenzija se prikazuje na profilu majstora
- [ ] Rating majstora se ažurira

---

## Admin panel

- [ ] Admin može pristupiti `/admin`
- [ ] Dashboard prikazuje metrike (korisnici, majstori, zahtjevi)
- [ ] Admin može verifikovati majstore
- [ ] Admin može pregledati zahtjeve i prijave

---

## Email (opciono)

- [ ] Ako je Resend podešen: notifikacije se šalju
- [ ] Ako Resend nije podešen: app radi bez grešaka, samo bez emaila

---

## Build i performanse

- [ ] `npm run build` prolazi bez grešaka
- [ ] `npm run start` pokreće app bez grešaka
- [ ] Stranice se učitavaju bez hydration grešaka
- [ ] Nema konzolnih grešaka na klijentu

---

## Test nalozi

- [ ] Admin: (ADMIN_EMAIL iz .env) / Test123!
- [ ] Korisnik: marko@test.me / Test123!
- [ ] Majstor: majstor.vodoinstalater@test.me / Test123!

*(Nalozi se kreiraju seed skriptom)*

---

## Finalna provjera

- [ ] E2E flow prođen: registracija → zahtjev → ponuda → prihvatanje → završetak → recenzija
- [ ] Admin flow prođen: prijava → dashboard → verifikacija majstora
- [ ] Nema JavaScript grešaka u browser konzoli
- [ ] Mobilni prikaz funkcionalan (responsive)

---

*Checklist potvrditi prije objave za prve korisnike u Nikšiću.*
