import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { REQUEST_CATEGORIES, MAX_GALLERY_IMAGES, MAX_HANDYMAN_CATEGORIES, CITIES } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const updateProfileSchema = z
  .object({
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
    viberPhone: z.string().max(20).optional().nullable(),
    whatsappPhone: z.string().max(20).optional().nullable(),
  })
  .refine((data) => data.categories.length <= MAX_HANDYMAN_CATEGORIES, {
    message: "Maksimalno 5 kategorija je dozvoljeno.",
    path: ["categories"],
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
      include: {
        user: { select: { name: true, email: true, phone: true, city: true } },
        workerCategories: { include: { category: true } },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil majstora nije pronađen" },
        { status: 404 }
      );
    }

    const categories = profile.workerCategories.map((wc) => wc.category.name);
    const { workerCategories, ...rest } = profile;
    return NextResponse.json({ success: true, data: { ...rest, categories } });
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

    let { cities } = parsed.data;
    if (cities.length === 0) {
      cities = [...CITIES];
    }

    const {
      phone,
      avatarUrl,
      categories,
      bio,
      galleryImages,
      yearsOfExperience,
      startingPrice,
      completedJobsCount,
      averageResponseMinutes,
      serviceAreasDescription,
      travelRadiusKm,
      availabilityStatus,
      viberPhone,
      whatsappPhone,
    } = parsed.data;

    if (categories.length > MAX_HANDYMAN_CATEGORIES) {
      return NextResponse.json(
        { success: false, error: "Maksimalno 5 kategorija je dozvoljeno." },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, workerStatus: true },
    });
    const hadProfileBefore = !!existingProfile;

    if (phone !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone: phone || null },
      });
    }

    const profile = await prisma.$transaction(async (tx) => {
      /** Osiguraj Category redove u bazi — bez ovoga PATCH pada kad DB nema novi naziv (npr. nakon deploya). */
      for (const name of categories) {
        await tx.category.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      }

      const categoryRecords = await tx.category.findMany({
        where: { name: { in: categories } },
        select: { id: true, name: true },
      });
      const categoryIds = categoryRecords.map((c) => c.id);
      if (categoryIds.length !== categories.length) {
        throw new Error("Kategorije nisu pronađene nakon upsert-a.");
      }
      const prof = await tx.handymanProfile.upsert({
        where: { userId: session.user!.id },
        create: {
          userId: session.user!.id,
          bio,
          cities,
          galleryImages: galleryImages ?? [],
        },
        update: {
          bio,
          cities,
          ...(existingProfile?.workerStatus === "ACTIVE" && { workerStatus: "PENDING_REVIEW" }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(galleryImages !== undefined && { galleryImages }),
          ...(yearsOfExperience !== undefined && { yearsOfExperience }),
          ...(startingPrice !== undefined && { startingPrice }),
          ...(completedJobsCount !== undefined && { completedJobsCount }),
          ...(averageResponseMinutes !== undefined && { averageResponseMinutes }),
          ...(serviceAreasDescription !== undefined && { serviceAreasDescription }),
          ...(travelRadiusKm !== undefined && { travelRadiusKm }),
          ...(availabilityStatus !== undefined && { availabilityStatus }),
          ...(viberPhone !== undefined && { viberPhone: viberPhone || null }),
          ...(whatsappPhone !== undefined && { whatsappPhone: whatsappPhone || null }),
        },
      });

      await tx.workerCategory.deleteMany({ where: { workerId: prof.id } });
      if (categoryIds.length > 0) {
        await tx.workerCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            workerId: prof.id,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.handymanProfile.findUnique({
        where: { id: prof.id },
        include: { workerCategories: { include: { category: true } } },
      });
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
    }

    const cats = profile.workerCategories.map((wc) => wc.category.name);
    const { workerCategories, ...rest } = profile;

    const userForSignals = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    if (!hadProfileBefore) {
      const { notifyAdminsNewPendingHandyman } = await import("@/lib/admin-signals");
      await notifyAdminsNewPendingHandyman({
        handymanUserId: session.user.id,
        displayName: userForSignals?.name?.trim() ?? "",
      });
    }

    if (existingProfile?.workerStatus === "ACTIVE") {
      const { notifyAdminsHandymanReturnedToReview } = await import("@/lib/admin-signals");
      await notifyAdminsHandymanReturnedToReview({
        handymanUserId: session.user.id,
        displayName: userForSignals?.name?.trim() ?? "",
      });
    }

    return NextResponse.json({ success: true, data: { ...rest, categories: cats } });
  } catch (error) {
    logError("PATCH handyman profile error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri ažuriranju profila" },
      { status: 500 }
    );
  }
}
