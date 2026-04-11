/**
 * Server-only: Google Gemini preko REST (Google AI Studio — besplatni tier, kasnije plaćeni planovi).
 * Bez dodatnog npm paketa.
 */

const DEFAULT_MODEL = "gemini-2.0-flash";

export type RequestDraftResult = { title: string; description: string };
export type HandymanBioResult = { bio: string };

function getApiKey(): string | null {
  const k = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  return k || null;
}

export function isAiAssistConfigured(): boolean {
  return !!getApiKey();
}

function extractJsonObject(raw: string): Record<string, unknown> {
  const t = raw.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const inner = fenced ? fenced[1].trim() : t;
  const brace = inner.match(/\{[\s\S]*\}/);
  const jsonStr = brace ? brace[0] : inner;
  return JSON.parse(jsonStr) as Record<string, unknown>;
}

async function generateText(systemInstruction: string, userPrompt: string): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error("AI_ASSIST_NO_KEY");

  const model = process.env.AI_ASSIST_GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(9000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`GEMINI_HTTP_${res.status}:${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text?.trim()) throw new Error("GEMINI_EMPTY");
  return text.trim();
}

const SYSTEM_REQUEST = `Ti si pomoćnik na platformi BrziMajstor.ME (Crna Gora). Korisnik piše zahtjev za majstora.
Pravila:
- Piši na crnogorskom/srpskom (ijekavski prihvatljiv), jasno i uljudno.
- NE uključuj telefone, email, linkove, korisničke handle, adrese ulica/brojeva u tekstu — korisnik ih unosi u posebna polja.
- Ne izmišljaj cijene niti garantuj rokove; možeš reći "po dogovoru" ako treba.
- Naslov: jedna kratka rečenica, max ~80 karaktera.
- Opis: 2–6 rečenica, šta treba, gdje u smislu prostorije (kuhinja/kupatilo), hitnost ako je spomenuta.
Odgovori ISKLJUČIVO kao JSON: {"title":"...","description":"..."}`;

const SYSTEM_BIO = `Ti si pomoćnik za profil majstora na BrziMajstor.ME (Crna Gora).
Pravila:
- Piši kratko, profesionalno, na crnogorskom/srpskom.
- NE uključuj telefone, email, linkove u tekstu.
- Ne laži o godinama iskustva ili certifikatima — samo formulacija na osnovu korisnikovih bilješki.
- Jedan ili dva pasusa, max ~900 karaktera.
Odgovori ISKLJUČIVO kao JSON: {"bio":"..."}`;

export async function generateRequestDraft(input: {
  draft: string;
  category?: string;
  city?: string;
  currentTitle?: string;
}): Promise<RequestDraftResult> {
  const notes =
    input.draft.trim() ||
    (input.currentTitle?.trim()
      ? "Nema dodatnog opisa — napiši smislen opis samo na osnovu naslova i konteksta."
      : "");
  const userPrompt = [
    input.currentTitle ? `Trenutni naslov (možeš poboljšati): ${input.currentTitle}` : "",
    input.category ? `Kategorija: ${input.category}` : "",
    input.city ? `Grad: ${input.city}` : "",
    `Bilješke korisnika:\n${notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const text = await generateText(SYSTEM_REQUEST, userPrompt);
  const obj = extractJsonObject(text);
  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  const description = typeof obj.description === "string" ? obj.description.trim() : "";
  if (!title || !description) throw new Error("GEMINI_BAD_JSON");
  return { title, description };
}

export async function generateHandymanBio(input: { draft: string }): Promise<HandymanBioResult> {
  const text = await generateText(SYSTEM_BIO, `Bilješke majstora:\n${input.draft}`);
  const obj = extractJsonObject(text);
  const bio = typeof obj.bio === "string" ? obj.bio.trim() : "";
  if (!bio) throw new Error("GEMINI_BAD_JSON");
  return { bio };
}
