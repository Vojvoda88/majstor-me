import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  requestId: z.string().cuid().optional(),
}).refine((d) => d.email || d.phone, { message: "Unesite email ili telefon" });

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { success: false, error: "Samo korisnici mogu pozivati majstore" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");

    if (parsed.data.requestId) {
      const req = await prisma.request.findUnique({
        where: { id: parsed.data.requestId },
      });
      if (!req || req.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Zahtjev nije pronađen" },
          { status: 404 }
        );
      }
    }

    const token = crypto.randomBytes(24).toString("hex");
    const invite = await prisma.handymanInvite.create({
      data: {
        inviterId: session.user.id,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone ?? null,
        requestId: parsed.data.requestId ?? null,
        token,
        status: "PENDING",
      },
    });

    // TODO: sendInviteEmail(invite) - kada email provider bude spreman
    // Link: /register?invite=TOKEN ili /register/invite/TOKEN

    return NextResponse.json({
      success: true,
      data: {
        inviteId: invite.id,
        inviteLink: `${process.env.NEXTAUTH_URL ?? "https://majstor.me"}/register?invite=${token}`,
        message: parsed.data.email
          ? "Pozivnica će biti poslata kada email servis bude konfigurisan."
          : "Pozivnica je kreirana. Pošaljite majstoru link za registraciju.",
      },
    });
  } catch (error) {
    logError("POST invite-handyman error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju poziva" },
      { status: 500 }
    );
  }
}
