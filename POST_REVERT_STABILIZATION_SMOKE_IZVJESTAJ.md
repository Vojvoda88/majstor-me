# POST-REVERT STABILIZATION / SMOKE IZVJEŠTAJ

_Datum provjere (lokalno okruženje): generisano iz repozitorija nakon revert commitova._

## 1. Pregledano stanje

- **`AppChrome` / globalni mobile nav u root layoutu:** **nema** (`app/layout.tsx` → samo `Providers` + `children`).
- **`MobileBottomNav`:** samo u **`app/dashboard/layout.tsx`** (post-revert očekivano ponašanje).
- **Prisma `VerifiedStatus` / `RequestAdminStatus`:** **nema** `SUSPICIOUS` u `schema.prisma` (revert potvrđen).
- **Grep:** nema referenci na `AppChrome`, `notify-admins`, `SUSPICIOUS` u `.ts/.tsx` kodu.
- **Git:** stanje odgovara post-revert stabilizaciji (revertovi + docs commit).

## 2. Šta je provjereno

| Provjera | Rezultat |
|----------|----------|
| `npx tsc --noEmit` | **PASS** |
| `npx next build` | **PASS** (79 stranica generisano, bez compile errora) |
| Ključni fajlovi (layout, dashboard, prisma enums) | Usklađeni sa opisom iznad |

## 3. Šta je promijenjeno

- **Ništa** u ovoj sesiji — build i typecheck su prošli bez potrebe za patch-em.

## 4. Izmijenjeni fajlovi

- **N/A** (samo izvještaj `POST_REVERT_STABILIZATION_SMOKE_IZVJESTAJ.md` ako se commituje).

## 5. Runtime potvrda

| Ruta | Rezultat | Napomena |
|------|----------|----------|
| `/` | **N/A (live)** | Lokalno: build uključuje `ƒ /`. Live: ručno u browseru. |
| `/login` | **N/A (live)** | FAIL signal: RSC error, 500, redirect loop. Relevantno: `app/login`, `lib/auth`, `middleware` ako postoji. |
| `/register` | **N/A (live)** | Isto. |
| `/dashboard/handyman` | **N/A (live)** | Zahtijeva sesiju majstora. FAIL: 500 / RSC. Zona: `app/dashboard/handyman`, layout, Prisma u page. |
| `/dashboard/handyman/profile` | **N/A (live)** | Isto + profil API. |
| `/credits` | **N/A** | U app routeru **nema** root `/credits`; majstor: **`/dashboard/handyman/credits`**. Admin: **`/admin/credits`**. |
| `/admin` | **N/A (live)** | FAIL: 500 / `requireAdmin` redirect na `/login`. Zona: `app/admin/layout`, `lib/admin/auth`. |

**Lokalno potvrđeno:** samo da se rute **uključuju u production build** bez greške — **ne** i HTTP 200 u runtime-u na produkciji.

## 6. Tačni problemi ako ih još ima

- **Root cause** originalnog RSC crash-a: **nije dokazan** ovim okruženjem (nema Vercel logova, digest-a, ni browsera na produkciji).
- **Produkcija** može i dalje imati problem ako je uzrok bio **nešto izvan ovog repoa** (env, DB stanje, cache deploya).

## 7. Root cause status

- **Nije potvrđen** (nema stack trace / digest sa produkcije nakon revert deploya).

## 8. Preporučeni naredni korak (samo jedan)

**Nakon deploya trenutnog `main` na produkciju:** uraditi **ručni production smoke** (tabela iz sekcije 5) u browseru; ako bilo šta vrati grešku, iz **Vercel → Functions / Logs** uzeti **tačan stack trace i digest** za **jednu** padajuću rutu — bez toga se root cause ne može zatvoriti dokazom.

## 9. Završni status

**DJELIMIČNO STABILNO** — lokalno **STABILNO** (build + typecheck PASS); **live stabilnost nije potvrđena** u ovom okruženju.
