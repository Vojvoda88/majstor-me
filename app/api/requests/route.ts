import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { REQUEST_CATEGORIES, MAX_REQUESTS_PER_DAY, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { sendNewRequestEmail } from "@/lib/email";
import { zodErrorToString } from "@/lib/api-response";

const createRequestSchema = z.object({
  category: z.enum(REQUEST_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000, "Opis predug"),
  city: z.string().min(1, "Unesite grad"),
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

    const where: Record<string, unknown> = { status };
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { success: false, error: "Samo korisnici mogu kreirati zahtjeve" },
        { status: 403 }
      );
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const requestCount = await prisma.request.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: yesterday },
      },
    });
    if (requestCount >= MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        { success: false, error: "Dostigli ste dnevni limit zahtjeva (5)" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const descTrimmed = parsed.data.description.trim();
    const duplicate = await prisma.request.findFirst({
      where: {
        userId: session.user.id,
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

    const req = await prisma.request.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
        description: descTrimmed,
      },
    });

    // Notify all handymen with matching category (no city restriction)
    const handymen = await prisma.user.findMany({
      where: {
        role: "HANDYMAN",
        handymanProfile: {
          categories: { has: parsed.data.category },
        },
      },
      select: { id: true },
    });
    for (const h of handymen) {
      sendNewRequestEmail(
        h.id,
        req.id,
        parsed.data.category,
        parsed.data.city
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    logError("POST request error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri kreiranju zahtjeva" },
      { status: 500 }
    );
  }
}
