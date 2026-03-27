"use server";

import { auth } from "@/lib/auth";
import { createRequestShared } from "@/lib/requests/create-request-shared";

export type CreateRequestActionResult =
  | { ok: true; data: { id: string; handymenNotified: number; guestAccessToken?: string } }
  | { ok: false; error: string };

/**
 * Kreiranje zahtjeva sa servera — auth() koristi cookies() (RSC / server action kontekst).
 * Nikad ne baca — nevalidan tok vraća { ok: false }; greške loguje [RequestCreateSubmit].
 */
export async function createRequestAction(body: unknown): Promise<CreateRequestActionResult> {
  try {
    console.info("[RequestCreateSubmit] action_start");
    let session: Awaited<ReturnType<typeof auth>> = null;
    try {
      session = await auth();
    } catch (authErr) {
      console.error("[RequestCreateSubmit] auth_failed", authErr);
      session = null;
    }
    console.info("[RequestCreateSubmit] action_auth", { hasUser: !!session?.user?.id });

    const result = await createRequestShared(session, body);
    if (!result.ok) {
      console.info("[RequestCreateSubmit] action_shared_not_ok", { status: result.status });
      return { ok: false, error: result.error };
    }
    console.info("[RequestCreateSubmit] action_success", { requestId: result.data.id });
    return { ok: true, data: result.data };
  } catch (e) {
    console.error("[RequestCreateSubmit] action_fatal", e);
    return {
      ok: false,
      error: "Greška pri snimanju zahtjeva. Pokušajte ponovo za nekoliko trenutaka.",
    };
  }
}
