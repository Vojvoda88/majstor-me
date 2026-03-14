import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { REQUEST_CATEGORIES, MAX_GALLERY_IMAGES } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const updateProfileSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  categories: z.array(z.enum(REQUEST_CATEGORIES as unknown as [string, ...string[]])),
  cities: z.array(z.string()),
  galleryImages: z.array(z.string().url()).max(MAX_GALLERY_IMAGES).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional().nullable(),
  startingPrice: z.number().min(0).optional().nullable(),
  completedJobsCount: z.number().int().min(0).optional(),
  averageResponseMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  serviceAreasDescription: z.string().max(500).optional().nullable(),
  travelRadiusKm: z.number().int().min(0).max(200).optional().nullable(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "EMERGENCY_ONLY"]).optional().nullable(),
});

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true, phone: true, city: true } } },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil majstora nije pronađen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    logError("GET handyman profile error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju profila" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (session.user.role !== "HANDYMAN") {
      return NextResponse.json(
        { success: false, error: "Samo majstori mogu ažurirati profil" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const {
      phone,
      avatarUrl,
      categories,
      cities,
      bio,
      galleryImages,
      yearsOfExperience,
      startingPrice,
      completedJobsCount,
      averageResponseMinutes,
      serviceAreasDescription,
      travelRadiusKm,
      availabilityStatus,
    } = parsed.data;

    if (phone !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone: phone || null },
      });
    }

    const profile = await prisma.handymanProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio,
        categories: categories as string[],
        cities,
        galleryImages: galleryImages ?? [],
      },
      update: {
        bio,
        categories: categories as string[],
        cities,
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(galleryImages !== undefined && { galleryImages }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(startingPrice !== undefined && { startingPrice }),
        ...(completedJobsCount !== undefined && { completedJobsCount }),
        ...(averageResponseMinutes !== undefined && { averageResponseMinutes }),
        ...(serviceAreasDescription !== undefined && { serviceAreasDescription }),
        ...(travelRadiusKm !== undefined && { travelRadiusKm }),
        ...(availabilityStatus !== undefined && { availabilityStatus }),
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    logError("PATCH handyman profile error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri ažuriranju profila" },
      { status: 500 }
    );
  }
}
