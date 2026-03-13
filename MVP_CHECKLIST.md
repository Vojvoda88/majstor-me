# Majstor.me – MVP Test Checklist

Korištenje prije prvog realnog testiranja sa korisnicima.

---

## 1. Autentifikacija

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 1.1 | Registracija kao korisnik (USER) | Nalog kreiran, redirect na /request/create |
| 1.2 | Registracija kao majstor (HANDYMAN) | Nalog kreiran, HandymanProfile kreiran, redirect na /dashboard/handyman |
| 1.3 | Registracija sa postojećim emailom | Greška: "Korisnik sa ovim email-om već postoji" |
| 1.4 | Prijava sa validnim kredencijalima | Uspješna prijava, redirect na callbackUrl ili / |
| 1.5 | Prijava sa pogrešnom lozinkom | Greška: "Pogrešan email ili lozinka" |
| 1.6 | Odjava | Korisnik odjavljen, redirect na home |

---

## 2. Tok zahtjeva (Request Flow)

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 2.1 | Kreiranje zahtjeva (USER) | Zahtjev kreiran, redirect na detalj stranicu |
| 2.2 | Kreiranje zahtjeva bez prijave | Redirect na /login |
| 2.3 | Kreiranje zahtjeva kao HANDYMAN | Zabranjeno, redirect na / |
| 2.4 | Prazan opis (< 10 karaktera) | Validaciona greška |
| 2.5 | Dupli zahtjev (isti opis danas) | Greška: "Već ste objavili isti zahtjev danas" |
| 2.6 | 6. zahtjev istog dana | Greška: "Dostigli ste dnevni limit (5)" |

---

## 3. Tok ponuda (Offer Flow)

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 3.1 | Majstor šalje ponudu na OPEN zahtjev | Ponuda kreirana, vidljiva korisniku |
| 3.2 | Slanje ponude bez prijave | 401 Unauthorized |
| 3.3 | Slanje ponude kao USER | 403 Forbidden |
| 3.4 | Slanje ponude na COMPLETED zahtjev | Greška: "Ovaj zahtjev više ne prihvata ponude" |
| 3.5 | Slanje druge ponude od istog majstora | Greška: "Već ste poslali ponudu" |
| 3.6 | Slanje ponude za kategoriju van profila | Greška: "Niste registrovani za ovu kategoriju" |
| 3.7 | Fiksna cijena bez iznosa | Validaciona greška |

---

## 4. Prihvatanje ponude i završetak posla

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 4.1 | Korisnik prihvata jednu ponudu | Ponuda ACCEPTED, ostale REJECTED, request IN_PROGRESS |
| 4.2 | Prihvatanje tuđe ponude (drugi USER) | 403 Forbidden |
| 4.3 | Prihvatanje već prihvaćene ponude | Greška: "Ponuda nije dostupna" |
| 4.4 | Korisnik označava posao završenim | Request COMPLETED |
| 4.5 | Označavanje završetka prije prihvatanja ponude | Greška: "Zahtjev mora biti u toku" |
| 4.6 | Majstor pokušava označiti završetak | Samo vlasnik zahtjeva može |

---

## 5. Recenzije

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 5.1 | Korisnik ostavlja recenziju nakon COMPLETED | Recenzija kreirana |
| 5.2 | Recenzija prije završetka posla | Greška: "Zahtjev mora biti završen" |
| 5.3 | Dupla recenzija na isti zahtjev | Greška: "Već ste ostavili recenziju" |
| 5.4 | Ocjena izvan 1–5 | Validaciona greška |
| 5.5 | rating_avg i review_count majstora | Ažurirani nakon recenzije |

---

## 6. Admin panel

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 6.1 | Pristup admin panelu kao USER | Redirect na / |
| 6.2 | Pristup admin panelu kao HANDYMAN | Redirect na / |
| 6.3 | Pristup admin panelu kao ADMIN | Dashboard vidljiv |
| 6.4 | Verifikacija majstora | Status promijenjen u VERIFIED |
| 6.5 | Pregled zahtjeva po statusu | Filter radi (OPEN, IN_PROGRESS, COMPLETED, CANCELLED) |
| 6.6 | Link na detalj zahtjeva | Otvara /request/[id] |
| 6.7 | Link na zahtjev iz prijave | Radi kada requestId postoji |

---

## 7. Zaštita od spama

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 7.1 | Više od 5 zahtjeva dnevno | Blokirano (429) |
| 7.2 | Isti tekst zahtjeva 2x isti dan | Blokirano |

---

## 8. Email obavještenja

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 8.1 | Nova ponuda | Korisnik prima email (ako RESEND_API_KEY postavljen) |
| 8.2 | Ponuda prihvaćena | Majstor prima email |
| 8.3 | Posao završen | Majstor prima email |
| 8.4 | Nova recenzija | Majstor prima email |
| 8.5 | Bez RESEND_API_KEY | Aplikacija radi, email se ne šalje (graceful) |

---

## 9. UI / UX

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 9.1 | Prazna lista zahtjeva (user) | Empty state sa linkom na kreiranje |
| 9.2 | Prazna lista (handyman) | Empty state |
| 9.3 | Loading stanje | Skeleton / spinner pri učitavanju |
| 9.4 | Greška učitavanja | Error boundary, "Pokušaj ponovo" |
| 9.5 | 404 stranica | "Stranica nije pronađena" |
| 9.6 | Submit disabled tokom slanja | Dugme onemogućeno |

---

## 10. Sigurnost

| # | Test | Očekivani rezultat |
|---|------|--------------------|
| 10.1 | API bez session | 401 za zaštićene rute |
| 10.2 | Pogrešna uloga za akciju | 403 Forbidden |
| 10.3 | Nema izloženih tajni u client bundle | Proveriti build |

---

## Brzi E2E flow (happy path)

1. Registruj se kao USER
2. Kreiraj zahtjev (npr. Vodoinstalater, Nikšić)
3. Odjavi se, registruj kao HANDYMAN
4. Ažuriraj profil (dodaj Vodoinstalater, Nikšić)
5. Pošalji ponudu na zahtjev
6. Odjavi se, prijavi kao USER
7. Prihvati ponudu
8. Označi posao završenim
9. Ostavi recenziju (npr. 5 zvjezdica)
10. Provjeri da majstor ima ažuriran rating_avg i review_count

---

*Datum kreiranja: Mart 2026*  
*Verzija: MVP 1.0*
