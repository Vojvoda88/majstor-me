import { NextResponse } from "next/server";
import { getPushServerConfig } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * Javni VAPID ključ za pretplatu (bez autentikacije). Isti kao VAPID_PUBLIC_KEY na serveru,
 * da klijent ne zavisi od NEXT_PUBLIC ugrađenog u starom buildu na Vercelu.
 */
export async function GET() {
  const cfg = getPushServerConfig();
  if (!cfg.hasPublicKey || !cfg.publicKeyNormalized) {
    return NextResponse.json({ success: false, error: "Push nije podešen" }, { status: 503 });
  }
  return NextResponse.json(
    { success: true, publicKey: cfg.publicKeyNormalized },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
