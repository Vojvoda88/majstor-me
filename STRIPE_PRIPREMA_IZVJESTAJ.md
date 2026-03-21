# STRIPE PRIPREMA — IZVJEŠTAJ

**Projekat:** BrziMajstor.ME (MajstorMe)  
**Datum:** 2026-03-16

---

## 1. Pregledano trenutno stanje

- **Gdje je bio stub:** ranije je `createCreditsCheckout` u `lib/payment.ts` bio placeholder; sada koristi **Stripe Checkout Session** (`mode: payment`, `price_data`, EUR).
- **Šta je već postojalo:** ruta `POST /api/checkout/credits` (auth majstor, `packageId`, poziv `createCreditsCheckout`), stranica `app/dashboard/handyman/credits/page.tsx`, keš aktivacija `POST /api/handyman/credits/cash-activation` koja validira pakete iz istog izvora (`CREDIT_PACKAGES`).
- **Šta je falilo:** stvarni Stripe SDK poziv, webhook koji knjiži kredite, idempotentnost, model/tablica za obradu eventa, premium UI blok za pakete, dokumentacija env varijabli.

---

## 2. Trenutni i ciljni paketi

- **U kodu (`lib/credit-packages.ts`):** samo 3 paketa — **9,99 € = 100**, **24,99 € = 300** (popular), **49,99 € = 650** (`credits_100`, `credits_300`, `credits_650`).
- **Usklađenost:** vrijednosti odgovaraju dogovoru; nema dodatnih paketa (npr. 99,99 €).
- **Potvrda:** sada važe isključivo ova 3 paketa u checkoutu, webhooku i keš aktivaciji.

---

## 3. Izmijenjeni fajlovi (pregled)

| Putanja | Šta | Zašto |
|--------|-----|--------|
| `lib/credit-packages.ts` | Tri fiksna paketa | Jedan izvor istine za cijenu/kredite |
| `lib/payment.ts` | `createCreditsCheckout`, `isPaymentConfigured`, `isStripeWebhookConfigured`, metadata (`userId`, `handymanId`, …) | Checkout + siguran fallback bez ključa |
| `lib/stripe-server.ts` | `getStripe()` singleton | Ne puca ako nema `STRIPE_SECRET_KEY` |
| `lib/stripe-webhook-credits.ts` | `applyCreditsFromCheckoutSession` | Knjiženje + validacija + idempotentnost |
| `app/api/webhooks/stripe/route.ts` | `POST`, raw body, `constructEvent`, `checkout.session.completed` | Stripe webhook |
| `prisma/schema.prisma` + migracija `20250321180000_stripe_processed_events` | `StripeProcessedEvent` | Jedinstven `stripeEventId` — nema duplog knjiženja po eventu |
| `components/credits/credit-packages-premium.tsx` | Premium grid paketa | Vizuelni sloj „premium“ bez redizajna cijelog dashboarda |
| `components/credits/credits-purchase-button.tsx` | CTA, `credentials: "include"` | Checkout redirect |
| `app/dashboard/handyman/credits/page.tsx` | `CreditPackagesPremium`, `max-w-5xl`, success/cancel banneri, upozorenje ako nema webhook secret | UX + transparentnost |
| `.env.example` | Stripe varijable + kratke upute | Šta ručno ubaciti |

---

## 4. Kako sada radi Stripe tok

- **Checkout session:** `stripe.checkout.sessions.create` — jedna stavka, `unit_amount` = cijena paketa u centima, `metadata`: `userId`, `handymanId`, `packageId`, `credits`, `amountEur`, `transactionType: credit_purchase`.
- **Success URL:** `{NEXTAUTH_URL}/dashboard/handyman/credits?success=1`
- **Cancel URL:** `{NEXTAUTH_URL}/dashboard/handyman/credits?canceled=1`
- **Webhook:** `POST /api/webhooks/stripe` — event **`checkout.session.completed`** → `applyCreditsFromCheckoutSession`.
- **Knjiženje kredita:** unutar `$transaction`: provjera moda, `payment_status`, tip transakcije, poklapanje paketa i `amount_total` sa očekivanim iznosom; update `HandymanProfile.creditsBalance`; `CreditTransaction` tip `PURCHASE`, `referenceId` = Stripe **session id**.
- **Zaštita od duplog knjiženja:** (1) zapis u `StripeProcessedEvent` po **`event.id`**; (2) ako već postoji `PURCHASE` sa istim `referenceId` (session id), event se označi obrađenim bez ponovnog dodavanja kredita.

---

## 5. Premium UI / UX promjene

- **Šta:** zamjena generičkog grid kartica sa **`CreditPackagesPremium`** — jači hijerarhija (broj kredita → cijena → procjena leadova), suptilan **border/glow** na popularnom paketu, bedž **„Najbolja vrijednost“**, diskretna hover elevacija na ostalim.
- **Efekat:** startup-premium osjećaj (slate + suptilan amber na preporuci), bez agresivnih animacija.
- **Preporučeni paket:** **300 kredita / 24,99 €** (`popular: true`) — najbolji odnos cijene po kreditu u odnosu na starter paket.

---

## 6. Šta je spremno odmah (iz koda)

- Fallback kada **nema** `STRIPE_SECRET_KEY`: online sekcija prikazuje poruku da kartica na sajtu još nije dostupna; keš aktivacija ostaje.
- Kreiranje checkouta i webhook logika u kodu — **nakon** env + migracije + Stripe dashboard podešavanja.
- Prikaz paketa i CTA na kredit stranici kada je ključ postavljen.

---

## 7. Šta ručno uraditi (vi)

1. **Env (lokalno / produkcija):** u `.env` kopirati iz `.env.example`:
   - `STRIPE_SECRET_KEY` (test ili live secret)
   - `STRIPE_WEBHOOK_SECRET` (signing secret sa webhook endpointa)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (preporučeno za konzistentnost; Checkout redirect i dalje radi bez njega na frontendu)
2. **`NEXTAUTH_URL`** mora biti tačan javni URL aplikacije (success/cancel linkovi).
3. **Baza:** pokrenuti migracije (`prisma migrate deploy` ili odgovarajući tok) da postoji tabela `stripe_processed_events`.
4. **Stripe Dashboard → Developers → Webhooks → Add endpoint:**
   - URL: `https://<vaš-domen>/api/webhooks/stripe`
   - Event: **`checkout.session.completed`**
   - Kopirati **Signing secret** u `STRIPE_WEBHOOK_SECRET`.
5. **Test mod:** koristiti test API ključeve i test karticu (npr. `4242…`).

---

## 8. Šta nije moglo biti 100% potvrđeno bez stvarnih Stripe ključeva

- Stvaran tok Stripe redirecta, potpis webhooka i tačan redoslijed „redirect vs webhook“ u produkciji.
- `prisma generate` / migracije na vašoj mašini ako je zaključan `query_engine` (zatvoriti `next dev` / IDE lock pa ponovo).

---

## 9. Završni status

**STRIPE JE TEHNIČKI SPREMAN ZA POVEZIVANJE** — ostaje: ubaciti ključeve, deployati migraciju, registrovati webhook i odraditi test kupovinu u Stripe test modu.

---

## Smoke plan (minimalno)

1. **Bez** `STRIPE_SECRET_KEY`: otvoriti `/dashboard/handyman/credits` kao majstor — stranica se učita; online blok kaže da kartica nije dostupna; keš radi.
2. **Sa** ključevima: klik na kupovinu → redirect na Stripe Checkout → Complete → povratak na `?success=1` → balans se poveća nakon webhooka (provjeriti Stripe Dashboard → Webhooks → eventi).
3. Ponovno slanje istog webhook eventa (Stripe replay) ne smije duplo dodati kredite.
