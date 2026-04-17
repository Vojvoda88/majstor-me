import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import { trackFunnelEvent } from "@/lib/funnel-events";

const bodySchema = z.object({
  fullName: z.string().trim().min(2, "Unesite ime i prezime").max(200),
  phone: z.string().trim().min(5, "Unesite telefon").max(40),
  city: z.string().trim().min(1, "Unesite grad").max(120),
  packageId: z
    .string()
    .refine((id) => CREDIT_PACKAGES.some((p) => p.id === id), { message: "Izaberite paket" }),
  paymentMethod: z.enum(["kes", "posta"]).optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Prijavite se." }, { status: 401 });
  }
  if (session.user.role !== "HANDYMAN") {
    return NextResponse.json({ ok: false, error: "Nemate pristup." }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.fullName?.[0] ??
      first.phone?.[0] ??
      first.city?.[0] ??
      first.packageId?.[0] ??
      "Proverite podatke.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const { fullName, phone, city, packageId, paymentMethod, note } = parsed.data;

  const { prisma } = await import("@/lib/db");

  await prisma.creditCashActivationRequest.create({
    data: {
      userId: session.user.id,
      fullName,
      phone,
      city,
      packageId,
      paymentMethod: paymentMethod ?? null,
      note: note && note.length > 0 ? note : null,
    },
  });

  await trackFunnelEvent(
    prisma,
    "cash_activation_requested",
    { packageId, paymentMethod: paymentMethod ?? "" },
    session.user.id
  );

  return NextResponse.json({ ok: true });
}
