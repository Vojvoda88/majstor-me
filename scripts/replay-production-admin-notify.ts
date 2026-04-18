/**
 * Jednokratni poziv produkcijskog API-ja da admin push/in-app prođu kroz Vercel (VAPID).
 * U .env ili .env.local (isti folder gdje je DATABASE_URL za skripte):
 *   PRODUCTION_URL=https://www.brzimajstor.me
 *   CRON_SECRET=isti kao na Vercelu
 */

function normalizeProductionBase(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  return s;
}

export function productionReplayConfigured(): boolean {
  const base = normalizeProductionBase(process.env.PRODUCTION_URL ?? process.env.PRODUCTION_SITE_URL);
  const secret = process.env.CRON_SECRET?.trim();
  return !!base && !!secret;
}

export type ReplayResult = { ok: boolean; status: number; body: unknown };

async function postCron(path: string, body: object): Promise<ReplayResult> {
  const base = normalizeProductionBase(process.env.PRODUCTION_URL ?? process.env.PRODUCTION_SITE_URL);
  const secret = process.env.CRON_SECRET?.trim();
  if (!base || !secret) {
    return { ok: false, status: 0, body: { error: "PRODUCTION_URL ili CRON_SECRET nedostaje" } };
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = await res.text().catch(() => null);
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

export async function replayAdminRequestNotifyOnProduction(requestId: string): Promise<ReplayResult> {
  return postCron("/api/cron/replay-admin-request-notify", { requestId });
}

export async function replayAdminHandymanNotifyOnProduction(handymanUserId: string): Promise<ReplayResult> {
  return postCron("/api/cron/replay-admin-handyman-notify", { handymanUserId });
}
