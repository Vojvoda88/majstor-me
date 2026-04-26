/**
 * Predlozi teksta za polja profila majstora (OpenAI). Kljuc ide samo u server env.
 */

const DEFAULT_MODEL = "gpt-4o-mini";

export function isHandymanAiSuggestConfigured(): boolean {
  return typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0;
}

const MAX_BIO = 4000;
const MAX_SERVICE = 500;

type SuggestField = "bio" | "serviceAreasDescription";

type SuggestInput = {
  field: SuggestField;
  /** Kratke bilješke majstora ili nacrt; može biti prazan. */
  notes: string;
  categoryLabels: string[];
  cityLabels: string[];
  yearsOfExperience: number | null;
  travelRadiusKm: number | null;
  availabilityLabel: string;
};

function buildSystemPrompt(field: SuggestField): string {
  if (field === "serviceAreasDescription") {
    return [
      "Ti si pomoćnik na platformi BrziMajstor.ME (Crna Gora). Pomažeš majstorima s istaknicama na profilu.",
      "Jezik: crnogorski / srpski (neutralan ijekavski). Kratak, jasan, poslovno — bez lažnih pretenzija.",
      "Ne izmišljaj telefone, adrese, certifikate, cijene ili iskustvo koje korisnik nije naveo. Bez em dash i bez markdown naslova.",
      "Izlaz: jedan do tri kratka paragrafa ili jedan paragraf + jedna rečenica — ukupno najviše do oko 500 znakova, strogo fokus na gdje i kako radite (putovanje, gradovi, radijus, fleksibilnost).",
    ].join(" ");
  }
  return [
    "Ti si pomoćnik na platformi BrziMajstor.ME (Crna Gora). Pomažeš majstorima s javnim opisom profila.",
    "Jezik: crnogorski / srpski (neutralan ijekavski). Ton: pouzdan, jasan, bez reklamnog preteraivanja.",
    "Ne izmišljaj telefone, cijene, certifikate, broj završenih poslova ili iskustvo koje nije navedeno. Bez markdown-a (#, **). Može 2 do 4 kratka paragrafa, ukupno do oko 1200 reči.",
  ].join(" ");
}

function buildUserPrompt(input: SuggestInput): string {
  const citiesLine =
    input.cityLabels.length > 0
      ? `Gradovi / mjesta: ${input.cityLabels.join(", ")}.`
      : "Gradovi: nijesu izabrani u formi — tretiraj da može rad u više mjesta / cijeloj regiji, bez izmišljanja konkretne adrese.";

  const bits = [
    `Polje: ${input.field === "bio" ? "Javni opis profila (šta radite, kome pomažete, kako djelujete)" : "Kraći opis područja rada"}.`,
    `Kategorije: ${input.categoryLabels.length ? input.categoryLabels.join(", ") : "(nijesu navedene — napiši neutralno da majstor unese kategorije u formi prije završetka profila.)"}.`,
    citiesLine,
    input.yearsOfExperience != null
      ? `Navedene godine iskustva: ${input.yearsOfExperience}.`
      : "Godine iskustva: nijesu navedene — ne pogađaj broj, može opširnije o struci bez godina.",
    input.travelRadiusKm != null
      ? `Radius putovanja: ${input.travelRadiusKm} km.`
      : "Radius putovanja: nije naveden — ne tvrdi broj km ako ga nema.",
    `Status dostupnosti: ${input.availabilityLabel}.`,
    input.notes.trim()
      ? `Bilješke / nacrt od majstora (iskoristi, ali očisti stil, bez privatnih podataka): ${input.notes.trim()}`
      : "Bilješke majstora: (prazno) — sastavi opis isključivo iz gornjih stavki.",
  ];
  return bits.join("\n");
}

function clampText(text: string, max: number): string {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "").trim() + "…";
}

/**
 * Jeden poziv ka OpenAI Chat Completions (JSON).
 * @throws Error s kratkom porukom na srpskom za prikaz korisniku
 */
export async function suggestHandymanText(input: SuggestInput): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("AI predlozi nijesu uključeni na serveru.");
  }

  const model = (process.env.OPENAI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const maxOut = input.field === "bio" ? 900 : 250;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(input.field) },
        { role: "user", content: buildUserPrompt(input) },
      ],
      max_tokens: maxOut,
      temperature: 0.65,
    }),
  });

  if (!res.ok) {
    await res.text().catch(() => undefined);
    throw new Error(
      res.status === 429
        ? "Previše zahtjeva prema servisu. Pokušajte za minut."
        : "Servis za predloge trenutno nije dostupan. Pokušajte poslije."
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Prazan odgovor. Pokušajte ponovo.");
  }

  const max = input.field === "bio" ? MAX_BIO : MAX_SERVICE;
  return clampText(raw, max);
}
