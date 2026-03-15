import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { REQUEST_CATEGORIES, MAX_REQUESTS_PER_DAY, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const createRequestSchema = z.object({
  requesterName: z.string().min(2, "Unesite ime"),
  title: z.string().min(3, "Naslov mora imati najmanje 3 karaktera"),
  category: z.enum(REQUEST_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000, "Opis predug"),
  city: z.string().min(1, "Unesite grad"),
  requesterPhone: z.string().min(6, "Unesite broj telefona"),
  requesterEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
  photos: z.array(z.string().url()).max(5, "Maksimalno 5 slika").optional().default([]),
});

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const status = searchParams.get("status") ?? "OPEN";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE))), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status,
      OR: [{ adminStatus: "DISTRIBUTED" }, { adminStatus: null }],
    };
    if (category) where.category = category;
    if (city) where.city = city;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          user: { select: { name: true, city: true } },
          offers: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { requests, total, page, limit },
    });
  } catch (error) {
    logError("GET requests error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju zahtjeva" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    const isGuest = !session?.user?.id;

    if (!isGuest && session!.user!.role !== "USER") {
      return NextResponse.json(
        { success: false, error: "Samo korisnici mogu kreirati zahtjeve" },
        { status: 403 }
      );
    }

    if (!isGuest) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const requestCount = await prisma.request.count({
        where: {
          userId: session!.user!.id,
          createdAt: { gte: yesterday },
        },
      });
      if (requestCount >= MAX_REQUESTS_PER_DAY) {
        return NextResponse.json(
          { success: false, error: "Dostigli ste dnevni limit zahtjeva (5)" },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const parsed = createRequestSchema.safeParse({
      ...body,
      requesterEmail: body.requesterEmail?.trim() || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const descTrimmed = parsed.data.description.trim();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const duplicate = isGuest
      ? null
      : await prisma.request.findFirst({
          where: {
            userId: session!.user!.id,
            description: descTrimmed,
            createdAt: { gte: yesterday },
          },
        });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Već ste objavili isti zahtjev danas" },
        { status: 400 }
      );
    }

    // Blacklist check – blacklisted telefoni ne mogu poslati nove zahtjeve
    const phoneNorm = parsed.data.requesterPhone.replace(/\D/g, "");
    const blacklistedPhones = await prisma.blacklistedPhone.findMany({
      select: { phone: true },
    });
    const isBlacklisted = blacklistedPhones.some((b) => b.phone.replace(/\D/g, "") === phoneNorm);
    if (isBlacklisted) {
      const reqSpam = await prisma.request.create({
        data: {
          userId: isGuest ? null : session!.user!.id,
          requesterName: isGuest ? parsed.data.requesterName : undefined,
          requesterPhone: parsed.data.requesterPhone,
          requesterEmail: isGuest ? (parsed.data.requesterEmail?.trim() || undefined) : undefined,
          title: parsed.data.title ?? undefined,
          category: parsed.data.category,
          subcategory: parsed.data.subcategory,
          description: descTrimmed,
          city: parsed.data.city,
          address: parsed.data.address,
          urgency: parsed.data.urgency,
          photos: parsed.data.photos ?? [],
          adminStatus: "SPAM",
        },
      });
      return NextResponse.json({
        success: true,
        data: { ...reqSpam, handymenNotified: 0 },
      });
    }

    const crypto = await import("crypto");
    const requesterToken = isGuest ? crypto.randomBytes(32).toString("hex") : undefined;
    const { requesterName, title, requesterPhone, requesterEmail, ...rest } = parsed.data;
    const emailTrimmed = requesterEmail?.trim() || undefined;

    const req = await prisma.request.create({
      data: {
        userId: isGuest ? null : session!.user!.id,
        requesterName: isGuest ? requesterName : undefined,
        requesterPhone: requesterPhone,
        requesterEmail: isGuest ? emailTrimmed : undefined,
        requesterToken: requesterToken ?? undefined,
        title: title ?? undefined,
        ...rest,
        description: descTrimmed,
        adminStatus: "PENDING_REVIEW",
      },
    });

    // Distribucija se NE pokreće ovdje – samo kada admin odobri (adminStatus = DISTRIBUTED)
    return NextResponse.json({
      success: true,
      data: {
        ...req,
        requesterToken: requesterToken ?? undefined,
        handymenNotified: 0,
      },
    });
  } catch (error) {
    logError("POST request error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri kreiranju zahtjeva" },
      { status: 500 }
    );
  }
}
