import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCreditsCheckout } from "@/lib/payment";
import { getPackageById } from "@/lib/credit-packages";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    if (session.user.role !== "HANDYMAN") {
      return NextResponse.json(
        { success: false, error: "Samo majstori mogu kupovati kredite" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const packageId = body.packageId;
    if (!packageId) {
      return NextResponse.json(
        { success: false, error: "Izaberite paket" },
        { status: 400 }
      );
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Nepoznat paket" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://majstor.me";
    const result = await createCreditsCheckout({
      handymanId: session.user.id,
      packageId: pkg.id,
      successUrl: `${baseUrl}/dashboard/handyman/credits?success=1`,
      cancelUrl: `${baseUrl}/dashboard/handyman/credits?canceled=1`,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri kreiranju plaćanja" },
      { status: 500 }
    );
  }
}
