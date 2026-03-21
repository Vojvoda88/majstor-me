# SUPPORT OPERATIVA ZA KEŠ AKTIVACIJU — IZVJEŠTAJ

**Datum:** 2026-03-21  
**Projekat:** BrziMajstor.ME

---

## 1. Kako support danas vidi zahtjeve

| Kanal | Šta daje |
|--------|-----------|
| **Admin → Krediti** (`/admin/credits`) | Tabela **„Zahtjevi za aktivaciju u kešu / Pošti“** — posljednjih 50 redova: datum, status, ime, telefon, grad, paket, način uplate, link na majstora + email naloga, napomena. |
| **Admin → Funnel** (`/admin/funnel`) | Samo **broj** događaja `cash_activation_requested` po periodu (nema kontakt podataka). |
| **Funnel događaj u bazi** | `funnel_events` sa `event = cash_activation_requested` i `metadata` (packageId, paymentMethod) — sekundarni trag. |
| **Prisma Studio / SQL** | I dalje moguće za puni pregled ili izmjenu `status` ručno. |

---

## 2. Da li zapis sadrži sve potrebne podatke

**Da.** Polja u `credit_cash_activation_requests`: `fullName`, `phone`, `city`, `packageId`, `paymentMethod`, `note`, `status`, `createdAt`, `userId` (+ preko admin tabele: **email i ime** naloga). Za ručni poziv i uparivanje sa nalogom — **dovoljno**.

---

## 3. Da li je korisniku jasan sljedeći korak

- **Success:** „Zahtjev je poslat“, objašnjenje da se **ručno obrađuje**, kontakt na **telefon ili email naloga**, krediti nakon potvrde uplate; **hitno:** mail/telefon podrške (iz env).
- **Stranica prije forme:** tekst + red „Podrška“ (email/telefon).

---

## 4. Minimalni problemi koji su nađeni

- Prije izmjene: support je **mogao** samo brojati funnel ili ići u Studio — **nije bilo jednog ekrana sa kontakt poljima**.
- **Status** u bazi ostaje `PENDING` dok ga neko ručno ne promijeni (nema workflow dugmića) — za pilot prihvatljivo ako tim dogovori ko ažurira (Studio/SQL).

---

## 5. Izmijenjeni fajlovi

| Fajl | Izmjena |
|------|---------|
| `app/admin/credits/page.tsx` | Tabela zahtjeva za keš aktivaciju (50 redova), labele za način uplate i status, link na majstora. |
| `components/credits/cash-activation-form.tsx` | Success copy: jasnije da je **ručna obrada** i da se javlja na **telefon ili email naloga**. |

---

## 6. Operativni zaključak

**SUPPORT TOK ZA KEŠ AKTIVACIJU JE DOVOLJNO SPREMAN ZA PILOT**

Support koristi **Admin → Krediti** za operativni rad; Funnel za trend; Studio/SQL po potrebi za status ili istoriju.
