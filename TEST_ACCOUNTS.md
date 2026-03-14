# Majstor.me – Test nalozi

Nalozi za ručno testiranje. Lozinka za sve: **Test123!**

---

## Admin

| Polje | Vrijednost |
|-------|------------|
| **Uloga** | ADMIN |
| **Email** | vidi ADMIN_EMAIL u .env |
| **Lozinka** | Test123! |
| **Svrha** | Pristup admin panelu, verifikacija majstora |

---

## Korisnik (USER)

| Polje | Vrijednost |
|-------|------------|
| **Uloga** | USER |
| **Email** | marko@test.me |
| **Lozinka** | Test123! |
| **Svrha** | Kreiranje zahtjeva, prihvatanje ponuda, ostavljanje recenzija |

Dodatni korisnici (isti password): ana@test.me, petar@test.me

---

## Majstor (HANDYMAN)

| Polje | Vrijednost |
|-------|------------|
| **Uloga** | HANDYMAN |
| **Email** | majstor.vodoinstalater@test.me |
| **Lozinka** | Test123! |
| **Svrha** | Slanje ponuda, verifikovan profil (Vodoinstalater) |

Dodatni majstori (isti password):
- majstor.elektricar@test.me (Električar)
- majstor.moler@test.me (Moler, Montaža)
- majstor.ciscenje@test.me (Čišćenje)
- majstor.klima@test.me (Klima servis)

---

**Napomena:** Nalozi se kreiraju seed skriptom (`npm run db:seed`). Ako seed nije pokrenut, registrujte se ručno.
