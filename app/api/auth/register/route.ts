import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Neispravan email"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "HANDYMAN"]).default("USER"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone, city, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Korisnik sa ovim email-om već postoji" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        city: city || null,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (role === "HANDYMAN") {
      await prisma.handymanProfile.create({
        data: {
          userId: user.id,
          categories: [],
          cities: ["Nikšić"],
        },
      });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    logError("Register error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri registraciji" },
      { status: 500 }
    );
  }
}
