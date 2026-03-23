"use server";

import { auth } from "@/lib/auth";
import { createRequestShared } from "@/lib/requests/create-request-shared";

export type CreateRequestActionResult =
  | { ok: true; data: { id: string; handymenNotified: number; guestAccessToken?: string } }
  | { ok: false; error: string };

/**
 * Kreiranje zahtjeva sa servera — auth() koristi cookies() (RSC / server action kontekst).
 */
export async function createRequestAction(body: unknown): Promise<CreateRequestActionResult> {
  const session = await auth();
  const result = await createRequestShared(session, body);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, data: result.data };
}
