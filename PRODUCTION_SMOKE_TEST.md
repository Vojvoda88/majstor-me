# Majstor.me – Production Smoke Test

Kontrolna lista od **10 koraka** za provjeru live aplikacije nakon deploya.
Izvršiti redom nakon prvog deploya na Vercel.

---

## Preduslov

- Deploy na Vercel završen
- `NEXTAUTH_URL` postavljen na tačan production URL
- Baza push-ovana (`npx prisma db push`)

---

## 1. Početna stranica (/)

- [ ] Stranica se učitava bez greške
- [ ] Vidi se "Majstor.me" u headeru
- [ ] Linkovi "Prijava" i "Registracija" rade

---

## 2. Registracija (/register)

- [ ] Forma se prikazuje
- [ ] Registracija kao **Korisnik** prolazi
- [ ] Redirect na `/request/create` nakon registracije

---

## 3. Prijava (/login)

- [ ] Forma se prikazuje
- [ ] Prijava sa novim nalogom prolazi
- [ ] Redirect na dashboard prema ulozi

---

## 4. Kreiranje zahtjeva (/request/create)

- [ ] Stranica se učitava (mora biti prijavljen korisnik)
- [ ] Forma: kategorija, opis, grad, hitnost
- [ ] Kreiranje zahtjeva prolazi
- [ ] Redirect na `/request/[id]` detalj stranicu

---

## 5. Detalj zahtjeva (/request/[id])

- [ ] Detalj zahtjeva se prikazuje
- [ ] Status, hitnost, grad, opis vidljivi
- [ ] Nema 404 za validan ID

---

## 6. User dashboard (/dashboard/user)

- [ ] Lista zahtjeva se prikazuje
- [ ] "Novi zahtjev" link radi
- [ ] Prazno stanje (ako nema zahtjeva) se prikazuje korektno

---

## 7. Handyman dashboard (/dashboard/handyman)

- [ ] Odjavi se, registruj kao **Majstor**
- [ ] Ažuriraj profil (kategorije, gradovi) ako treba
- [ ] Dashboard prikazuje otvorene zahtjeve
- [ ] Link na detalj zahtjeva radi
- [ ] Slanje ponude prolazi

---

## 8. Admin panel (/admin)

- [ ] Kreiraj admin nalog (role=ADMIN u bazi) ili koristi seed
- [ ] Prijavi se kao admin
- [ ] Admin dashboard se učitava
- [ ] Metrike (korisnici, majstori, zahtjevi) se prikazuju
- [ ] Link na Majstori, Zahtjevi, Korisnici radi

---

## 9. API i greške

- [ ] U browser konzoli nema crvenih grešaka
- [ ] Pri pokušaju pristupa zaštićenoj stranici bez prijave → redirect na login
- [ ] Pogrešan zahtjev ID → 404 ili "Zahtjev nije pronađen"

---

## 10. Opciono: Email (Resend)

- [ ] Ako je `RESEND_API_KEY` postavljen: provjeri da app i dalje radi
- [ ] Ako nije postavljen: app mora raditi normalno (samo bez slanja emaila)

---

**Sve prolazi?** Aplikacija je spremna za prve korisnike.

**Nešto failuje?** Provjeri Vercel **Deployments** → **Functions** → logs, i env varijable.
