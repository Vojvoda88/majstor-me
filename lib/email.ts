import { Resend } from "resend";
import { prisma } from "@/lib/db";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = process.env.EMAIL_FROM ?? "Majstor.me <onboarding@resend.dev>";

async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

export async function sendNewOfferEmail(
  requestOwnerId: string,
  requestCategory: string,
  handymanName: string
) {
  const resend = getResend();
  if (!resend) return;
  const to = await getUserEmail(requestOwnerId);
  if (!to) return;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Nova ponuda na vaš zahtjev: ${requestCategory}`,
      html: `
        <p>Zdravo,</p>
        <p><strong>${handymanName}</strong> vam je poslao ponudu na zahtjev za <strong>${requestCategory}</strong>.</p>
        <p>Pogledajte ponude i prihvatite onu koja vam najviše odgovara.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/user">Pregledaj ponude →</a></p>
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
