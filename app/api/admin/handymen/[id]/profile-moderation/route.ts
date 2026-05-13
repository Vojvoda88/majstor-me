import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import {
  profileModerationNoticeBody,
  profileModerationNoticeTitle,
  type ModerationReasonCode,
} from "@/lib/admin/handyman-profile-moderation-notice";
import { sendAdminDirectMessageEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { deleteStorageObjectByPublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z
  .object({
    bio: z.string().max(8000).optional(),
    removeAvatar: z.boolean().optional(),
    removeGalleryUrls: z.array(z.string().url()).max(20).optional(),
    reason: z.enum(["PHONE_NUMBER", "INAPPROPRIATE_CONTENT"]),
    sendEmail: z.boolean().optional().default(true),
  })
  .refine(
    (d) =>
      d.bio !== undefined ||
      !!d.removeAvatar ||
      (d.removeGalleryUrls?.length ?? 0) > 0,
    { message: "Izaberite barem jednu izmjenu (opis, profilna ili galerija)." }
  );

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminApi("workers_write", request);
    if (!authResult.ok) return authResult.response;

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos." },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const { id: handymanUserId } = await params;

    const row = await prisma.user.findUnique({
      where: { id: handymanUserId, role: "HANDYMAN" },
      select: {
        id: true,
        name: true,
        email: true,
        handymanProfile: {
          select: {
            bio: true,
            avatarUrl: true,
            galleryImages: true,
          },
        },
      },
    });

    if (!row?.handymanProfile) {
      return NextResponse.json({ success: false, error: "Majstor nije pronađen." }, { status: 404 });
    }

    const hp = row.handymanProfile;
    let nextBio = hp.bio;
    let nextAvatar = hp.avatarUrl;
    let nextGallery = [...hp.galleryImages];

    let changedBio = false;
    let removedAvatar = false;
    let removedGalleryCount = 0;

    const urlsToDeleteFromStorage: string[] = [];

    if (parsed.data.bio !== undefined) {
      const trimmed = parsed.data.bio.trim();
      const newVal = trimmed.length === 0 ? null : trimmed;
      if ((hp.bio ?? "") !== (newVal ?? "")) {
        changedBio = true;
        nextBio = newVal;
      }
    }

    if (parsed.data.removeAvatar && hp.avatarUrl) {
      removedAvatar = true;
      urlsToDeleteFromStorage.push(hp.avatarUrl);
      nextAvatar = null;
    }

    if (parsed.data.removeGalleryUrls?.length) {
      const allowed = new Set(hp.galleryImages);
      for (const url of parsed.data.removeGalleryUrls) {
        if (!allowed.has(url)) {
          return NextResponse.json(
            { success: false, error: "Jedna od označenih fotografija ne pripada ovom profilu." },
            { status: 400 }
          );
        }
      }
      nextGallery = hp.galleryImages.filter((u) => !parsed.data.removeGalleryUrls!.includes(u));
      removedGalleryCount = hp.galleryImages.length - nextGallery.length;
      for (const u of parsed.data.removeGalleryUrls) {
        urlsToDeleteFromStorage.push(u);
      }
    }

    if (!changedBio && !removedAvatar && removedGalleryCount === 0) {
      return NextResponse.json(
        { success: false, error: "Nema izmjena u odnosu na trenutni profil." },
        { status: 400 }
      );
    }

    await prisma.handymanProfile.update({
      where: { userId: handymanUserId },
      data: {
        bio: nextBio,
        avatarUrl: nextAvatar,
        galleryImages: nextGallery,
      },
    });

    await Promise.all(urlsToDeleteFromStorage.map((u) => deleteStorageObjectByPublicUrl(u)));

    const reason: ModerationReasonCode = parsed.data.reason;
    const title = profileModerationNoticeTitle();
    const body = profileModerationNoticeBody({
      reason,
      changedBio,
      removedAvatar,
      removedGalleryCount,
    });

    await createNotification(row.id, "PROFILE_MODERATED", title, {
      body,
      link: "/dashboard/handyman/profile",
      idempotencyKey: `profile_mod:${handymanUserId}:${authResult.session.user.id}:${Date.now()}`,
    });

    if (parsed.data.sendEmail) {
      void sendAdminDirectMessageEmail({
        to: row.email,
        handymanName: row.name,
        title,
        body,
      });
    }

    await createAuditLog(prisma, {
      adminId: authResult.session.user.id,
      adminRole: authResult.adminRole,
      actionType: "HANDYMAN_PROFILE_MODERATION",
      entityType: "handyman",
      entityId: handymanUserId,
      oldValue: {
        bio: hp.bio,
        avatarUrl: hp.avatarUrl,
        galleryImages: hp.galleryImages,
      },
      newValue: {
        bio: nextBio,
        avatarUrl: nextAvatar,
        galleryImages: nextGallery,
        reason,
        notifyEmail: parsed.data.sendEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[profile-moderation]", e);
    return NextResponse.json({ success: false, error: "Greška pri snimanju." }, { status: 500 });
  }
}
