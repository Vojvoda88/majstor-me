import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const postMessageSchema = z.object({
  content: z.string().min(1, "Poruka ne smije biti prazna").max(2000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const { requestId } = await params;

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true } },
        offers: {
          where: { status: "ACCEPTED" },
          include: { handyman: { select: { id: true } } },
        },
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    const acceptedHandymanId = req.offers[0]?.handymanId;
    const isOwner = req.userId === session.user.id;
    const isHandyman = acceptedHandymanId === session.user.id;

    if (!isOwner && !isHandyman) {
      return NextResponse.json(
        { success: false, error: "Nemate pristup ovom razgovoru" },
        { status: 403 }
      );
    }

    if (!acceptedHandymanId) {
      return NextResponse.json({ success: true, data: { messages: [], conversationId: null } });
    }

    let conv = await prisma.conversation.findUnique({
      where: { requestId },
      include: {
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { requestId },
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conv.id,
        messages: conv.messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          senderId: m.senderId,
          senderName: m.sender.name,
          isMe: m.senderId === session.user!.id,
        })),
      },
    });
  } catch (error) {
    logError("GET conversation error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju razgovora" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (isRateLimited(`chat:${session.user.id}`, 60, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše poruka. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(`chat:${session.user.id}`)) } }
      );
    }

    const { requestId } = await params;
    const body = await request.json();
    const parsed = postMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        offers: { where: { status: "ACCEPTED" } },
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    const acceptedHandymanId = req.offers[0]?.handymanId;
    const isOwner = req.userId === session.user.id;
    const isHandyman = acceptedHandymanId === session.user.id;

    if (!isOwner && !isHandyman || !acceptedHandymanId) {
      return NextResponse.json(
        { success: false, error: "Nemate pristup ovom razgovoru" },
        { status: 403 }
      );
    }

    let conv = await prisma.conversation.findUnique({
      where: { requestId },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { requestId },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: session.user.id,
        content: parsed.data.content.trim(),
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    const otherUserId = isOwner ? acceptedHandymanId : req.userId;
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: "NEW_MESSAGE",
        title: "Nova poruka",
        body: parsed.data.content.slice(0, 100),
        link: `/request/${requestId}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: message.sender.name,
        isMe: true,
      },
    });
  } catch (error) {
    logError("POST message error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju poruke" },
      { status: 500 }
    );
  }
}
