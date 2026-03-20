# Majstor.me – Monetizaciona pravila

Dokument definiše pravila za kreditni model i lead unlock. Preporuke su bazirane na best practices i CG tržištu.

---

## 1. REFUND PRAVILO

**Pitanje:** Da li majstor dobija povrat kredita ako je lead spam / lažan / nedostupan?

**Preporuka:**

| Scenario | Refund? | Napomena |
|----------|---------|----------|
| Spam / očigledno lažan zahtjev | ✅ Da | Admin označava SPAM → automatski refund svima koji su otključali |
| Korisnik ne odgovara u roku (npr. 7 dana) | ❌ Ne | Standardno – majstor plaća za pristup, ne za rezultat |
| Korisnik otkazuje / nije dostupan | ❌ Ne | Rizik je na majstoru |
| Dupli zahtjev (isti korisnik, isti posao) | Individualno | Admin može refundirati ako je očigledna greška |
| Tehnička greška (pogrešan broj, prazan lead) | ✅ Da | Slučaj za support – ručni refund |

**Implementacija:**
- Admin akcija: "Označi spam + refund svima"
- API: `POST /api/admin/requests/[id]/spam-with-refund` – označi SPAM, refundira sve `RequestContactUnlock` za taj request
- Support: mogućnost ručnog dodavanja kredita (već postoji kroz admin)

---

## 2. DUPLI UNLOCK

**Pitanje:** Da li više majstora može otključati isti lead? Koliko maksimalno?

**Preporuka: NE OGRANIČAVATI.**

- Svaki majstor koji plati može otključati.
- Korisnik dobija više ponuda – bolje za njega.
- Platforma zarađuje više – bolje za nas.
- "Exclusivity" bi smanjila broj otključavanja i konverziju.

**Alternativa (ako se želi limit):**
- Max 5–10 majstora po leadu.
- Nakon toga: "Ovaj lead je otključan od maksimalnog broja majstora."
- Manje preporučeno za start – možete dodati kasnije ako se pokaže problem (previše poziva korisniku).

**Trenutno stanje u kodu:** Nema limita – više majstora može otključati isti lead.

---

## 3. LEAD EXPIRY

**Pitanje:** Koliko dugo lead vrijedi za otključavanje?

**Preporuka:**

| Faza | Rok | Logika |
|------|-----|--------|
| Za otključavanje | Nema hard roka | Lead ostaje otključiv dok je status OPEN |
| Automatsko zatvaranje | 14–30 dana | Ako niko ne prihvati ponudu ili korisnik ne reaguje, request se može automatski zatvoriti |
| Prikaz u listi | Prioritet starijim | Hitni leadovi (HITNO_DANAS) mogu imati poseban prioritet u listi |

**Konkretno:**
- Lead može biti otključiv dok je `status === "OPEN"` i `adminStatus !== "SPAM" | "DELETED"`.
- Nakon što korisnik prihvati ponudu, status prelazi u IN_PROGRESS – novi majstori više ne mogu otključati.
- Stari zahtjevi (npr. 30+ dana) mogu biti automatski zatvoreni – cron job ili background task.

**Implementacija:**
- Nema promjena za "expiry za unlock" – koristi se postojeći status.
- Opciono: dodati `expiresAt` na Request za automatsko zatvaranje starih leadova.

---

## 4. VERIFIED LEAD QUALITY

**Pitanje:** Potvrđen telefon korisnika – bolji score, skuplji ali vrijedniji lead?

**Preporuka: DA, uvesti Verified Lead tier.**

| Lead tip | Cijena | Uvjet | Vrijednost |
|----------|--------|-------|------------|
| Standard | 25 kredita | NIJE_HITNO, bez verifikacije | Osnovna |
| Urgent | 35 kredita | U_NAREDNA_2_DANA | Srednja |
| Premium | 45 kredita | HITNO_DANAS | Visoka |
| Verified | +10 kredita | `user.emailVerified` ili verifikovan telefon | Veća konverzija |

**Logika:**
- Ako korisnik ima `emailVerified` ili je prošao phone verification → +10 kredita na bazičnu cijenu.
- Verified lead = kvalitetniji, manje spama, veća šansa da će odgovoriti.
- Majstori vide badge "Verificiran korisnik" na leadu – više su spremni platiti.

**Implementacija:**
- U `getCreditsForLead()`: ako `user?.emailVerified` ili `phoneVerified` → bonus +10.
- U UI: Badge "Verificiran" na lead preview.
- Opciono: poseban `phoneVerified` flag ako uvedete SMS verifikaciju.

---

## SAŽETAK – Šta implementirati prvo

1. **Refund za spam** – admin akcija + API (prioritet)
2. **Verified lead bonus** – +10 kredita u `lead-tier.ts` (lako)
3. **Lead expiry** – nije hitno; trenutni status flow je dovoljan
4. **Limit na unlock** – ne uvoditi na start

---

## POVEZANI FAJLOVI

- `lib/lead-tier.ts` – tier i bonusi
- `lib/credits.ts` – refund funkcija (dodati)
- `app/admin/` – spam-with-refund akcija
- `prisma/schema.prisma` – `User.emailVerified` (već postoji)
