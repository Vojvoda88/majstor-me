import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = process.env.EMAIL_FROM ?? "Majstor.me <onboarding@resend.dev>";

async function getUserEmail(userId: string): Promise<string | null> {
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

export async function sendNewRequestEmail(
  handymanId: string,
  requestId: string,
  requestCategory: string,
  requestCity: string
) {
  const resend = getResend();
  if (!resend) return;
  const to = await getUserEmail(handymanId);
  if (!to) return;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://majstor.me";
  const link = `${baseUrl}/request/${requestId}`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Novi zahtjev: ${requestCategory} u ${requestCity}`,
      html: `
        <p>Zdravo,</p>
        <p>Novi zahtjev za <strong>${requestCategory}</strong> u <strong>${requestCity}</strong>.</p>
        <p><a href="${link}">Pogledaj zahtjev i pošalji ponudu →</a></p>
        <p>— Majstor.me</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}

/**
 * Pošalji email korisniku o novoj ponudi.
 * Za registrovanog korisnika: requestOwnerId.
 * Za guest: requesterEmail (pozovite sendNewOfferEmailToAddress).
 */
export async function sendNewOfferEmail(
  requestOwnerId: string | null,
  requestCategory: string,
  handymanName: string,
  requesterEmail?: string | null
) {
  const resend = getResend();
  if (!resend) return;
  const to = requestOwnerId
    ? await getUserEmail(requestOwnerId)
    : requesterEmail?.trim() || null;
  if (!to) return;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://majstor.me";
  const link = `${baseUrl}/request`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Nova ponuda na vaš zahtjev: ${requestCategory}`,
      html: `
        <p>Zdravo,</p>
        <p><strong>${handymanName}</strong> vam je poslao ponudu na zahtjev za <strong>${requestCategory}</strong>.</p>
        <p>Pogledajte ponude i prihvatite onu koja vam najviše odgovara.</p>
        <p><a href="${link}">Pregledaj ponude →</a></p>
        <p>— Majstor.me</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}

export async function sendOfferAcceptedEmail(
  handymanId: string,
  requestCategory: string,
  userName: string
) {
  const resend = getResend();
  if (!resend) return;
  const to = await getUserEmail(handymanId);
  if (!to) return;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Ponuda prihvaćena: ${requestCategory}`,
      html: `
        <p>Zdravo,</p>
        <p><strong>${userName}</strong> je prihvatio vašu ponudu za <strong>${requestCategory}</strong>.</p>
        <p>Kontaktirajte korisnika i zaključite posao.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/handyman">Dashboard →</a></p>
        <p>— Majstor.me</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}

export async function sendJobCompletedEmail(
  handymanId: string,
  requestCategory: string
) {
  const resend = getResend();
  if (!resend) return;
  const to = await getUserEmail(handymanId);
  if (!to) return;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Posao završen: ${requestCategory}`,
      html: `
        <p>Zdravo,</p>
        <p>Korisnik je označio posao <strong>${requestCategory}</strong> kao završen.</p>
        <p>Hvala što ste koristili Majstor.me!</p>
        <p>— Majstor.me</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}

export async function sendNewReviewEmail(
  handymanId: string,
  rating: number,
  requestCategory: string
) {
  const resend = getResend();
  if (!resend) return;
  const to = await getUserEmail(handymanId);
  if (!to) return;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Nova recenzija: ${rating}/5 za ${requestCategory}`,
      html: `
        <p>Zdravo,</p>
        <p>Dobili ste novu recenziju (${rating}/5) za posao <strong>${requestCategory}</strong>.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/handyman">Pogledaj profil →</a></p>
        <p>— Majstor.me</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}
