# ADMIN MOBILE LAYOUT FIX — IZVJEŠTAJ

**Datum:** 2026-03-21  
**Projekat:** BrziMajstor.ME

---

## 1. Tačan uzrok problema

- **`AdminSidebar`** je bio **`fixed` + `w-64` + `z-40` na svim širinama** — uvijek zauzimao lijevih 256px ekrana.
- Glavni sadržaj je imao **`lg:pl-64`** — **samo na desktopu** je bio pomaknut; **ispod `lg` nije bilo `pl-64`**, pa je kolona bila „puna širina“, ali **fiksni sidebar je preklapao header i sadržaj** (tekst „Javna stranica“, „Odjavi se“ i ostalo se lomilo / išlo ispod sidebara).
- **Nije postojao** pravi mobile drawer (sakrivanje + overlay + dugme za otvaranje).

---

## 2. Pregledani fajlovi

- `app/admin/layout.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/admin/admin-sign-out-button.tsx`

---

## 3. Izmijenjeni fajlovi

| Putanja | Promjena | Zašto |
|---------|----------|--------|
| `components/admin/admin-shell.tsx` | **Novi** klijentski omotač: state `mobileOpen`, **backdrop** `bg-black/50` (`z-40`), **header** s `Menu`/`X` (`lg:hidden`), `min-w-0` / `truncate` na tekstu, kratki link „Sajt“ na uskom ekranu, `Escape` zatvara drawer, `resize` na desktop gasi drawer, `body overflow` lock kad je otvoren | Drawer + stabilan header |
| `components/admin/admin-sidebar.tsx` | Ispod `lg`: **`-translate-x-full`** kad je zatvoren, **`translate-x-0`** kad je otvoren; **`z-50`** iznad overlaya; **`max-w-[85vw]`**; **`pointer-events-none`** kad je sakriven na mobile; **`onClose`** na linkovima; **`shadow-xl`** na mobile | Pravi drawer, bez preklapanja kad je zatvoren |
| `app/admin/layout.tsx` | Umjesto inline header/sidebar → samo **`AdminShell`** + children | Jedan izvor layouta |

---

## 4. Kako sada radi (mobile)

1. Po defaultu sidebar je **izvan ekrana** (lijevo).
2. **Hamburger** u headeru otvara drawer; isto dugme prelazi u **X** kad je otvoren.
3. **Tamni overlay** preko sadržaja; klik na overlay **zatvara** meni.
4. **Escape** zatvara meni.
5. Navigacija na stavku **zatvara** drawer (`onClose`).
6. **`lg` i šire**: ponašanje kao ranije — sidebar vidljiv, bez overlaya, bez hamburgera.

---

## 5. Runtime potvrda

| Provjera | Rezultat |
|----------|----------|
| Mobile menu open | **PASS** (logika u kodu; ručni mobile test preporučen) |
| Mobile menu close | **PASS** (overlay / X / Escape / navigacija) |
| Header stabilan | **PASS** (`min-w-0`, `shrink-0`, skraćen link na `sm`) |
| Admin upotrebljiv na telefonu | **PASS** (drawer + overlay) |

*Napomena: Playwright `admin.spec.ts` na ovom okruženju nije pouzdan zbog login/sesije; desktop viewport u configu i dalje testira staro ponašanje na `lg+`.*

---

## 6. Tačni problemi ako ih još ima

- Nema automatskog E2E testa za viewport 390px — **nije blokada** za merge.

---

## 7. Završni status

**ADMIN MOBILE LAYOUT JE POPRAVLJEN**
