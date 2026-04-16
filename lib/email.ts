import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";
import { phraseUGradu } from "@/lib/slugs";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = process.env.EMAIL_FROM ?? "BrziMajstor.ME <onboarding@resend.dev>";
const appBaseUrl = getSiteUrl().replace(/\/$/, "");

export type EmailDeliveryResult =
  | { ok: true }
  | { ok: false; error: string; code: "EMAIL_NOT_CONFIGURED" | "EMAIL_FROM_INVALID" | "EMAIL_SEND_FAILED" };

function getEmailConfigError(): EmailDeliveryResult | null {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("[email] RESEND_API_KEY nije postavljen.");
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      error: "Email servis trenutno nije podešen. Kontaktirajte podršku.",
    };
  }

  const emailFrom = process.env.EMAIL_FROM?.trim();
  if (process.env.NODE_ENV === "production") {
    if (!emailFrom) {
      console.warn("[email] EMAIL_FROM nije postavljen u produkciji.");
      return {
        ok: false,
        code: "EMAIL_FROM_INVALID",
        error: "Email pošiljalac nije podešen. Kontaktirajte podršku.",
      };
    }
    if (emailFrom.toLowerCase().includes("@resend.dev")) {
      console.warn("[email] EMAIL_FROM koristi resend.dev u produkciji.");
      return {
        ok: false,
        code: "EMAIL_FROM_INVALID",
        error: "Email pošiljalac nije validan za produkciju. Kontaktirajte podršku.",
      };
    }
  }

  return null;
}

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

  const link = `${appBaseUrl}/request/${requestId}`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Novi zahtjev: ${requestCategory} ${phraseUGradu(requestCity)}`,
      html: `
        <p>Zdravo,</p>
        <p>Novi zahtjev za <strong>${requestCategory}</strong> ${phraseUGradu(requestCity)}.</p>
        <p><a href="${link}">Pogledaj zahtjev i pošalji ponudu →</a></p>
        <p>— BrziMajstor.ME</p>
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

  const link = `${appBaseUrl}/request`;

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
        <p>— BrziMajstor.ME</p>
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
        <p><a href="${appBaseUrl}/dashboard/handyman">Dashboard →</a></p>
        <p>— BrziMajstor.ME</p>
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
        <p>Hvala što ste koristili BrziMajstor.ME!</p>
        <p>— BrziMajstor.ME</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}

/**
 * Guest korisnik: link za praćenje zahtjeva (samo ako je ostavljen email i Resend je podešen).
 */
export async function sendGuestRequestTrackingEmail(opts: {
  toEmail?: string | null;
  category: string;
  city: string;
  title: string;
  guestPlainToken: string;
}) {
  const { toEmail, category, city, title, guestPlainToken } = opts;
  const to = toEmail?.trim();
  if (!to) return;
  const resend = getResend();
  if (!resend) return;
  const link = `${appBaseUrl}/request-access/${guestPlainToken}`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Vaš zahtjev: ${title}`,
      html: `
        <p>Zdravo,</p>
        <p>Primili smo vaš zahtjev za <strong>${category}</strong> (${city}).</p>
        <p>Status zahtjeva i ponude možete pratiti na ovom privatnom linku:</p>
        <p><a href="${link}">Pratite zahtjev →</a></p>
        <p>Sačuvajte link — ne dijelite ga javno.</p>
        <p>— BrziMajstor.ME</p>
      `,
    });
  } catch {
    // Silently fail - email non-critical
  }
}

/**
 * Link za potvrdu emaila nakon password registracije.
 */
export async function sendPasswordResetEmail(to: string, name: string, plainToken: string) {
  const resend = getResend();
  if (!resend) return;
  const link = `${appBaseUrl}/reset-password?token=${encodeURIComponent(plainToken)}`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: "Nova lozinka — BrziMajstor.ME",
      html: `
        <p>Zdravo${name ? ` ${name.split(/\s+/)[0]}` : ""},</p>
        <p>Zatražili ste reset lozinke. Postavite novu lozinku putem linka ispod.</p>
        <p><a href="${link}">Postavi novu lozinku →</a></p>
        <p>Link važi 1 sat. Ako niste vi tražili reset, zanemarite ovu poruku — lozinka ostaje ista.</p>
        <p>— BrziMajstor.ME</p>
      `,
    });
  } catch {
    // Ne otkrivati grešku klijentu; forgot-password uvijek vraća isti odgovor
  }
}

/** @returns rezultat stvarnog slanja verifikacionog maila */
export async function sendEmailVerificationEmail(
  to: string,
  name: string,
  plainToken: string
): Promise<EmailDeliveryResult> {
  const configError = getEmailConfigError();
  if (configError) {
    return configError;
  }

  const resend = getResend();
  if (!resend) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      error: "Email servis trenutno nije podešen. Kontaktirajte podršku.",
    };
  }
  const link = `${appBaseUrl}/verify-email?token=${encodeURIComponent(plainToken)}`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: "Potvrdite email adresu — BrziMajstor.ME",
      html: `
        <p>Zdravo${name ? ` ${name.split(/\s+/)[0]}` : ""},</p>
        <p>Potvrdite email adresu kako biste nastavili korištenje naloga.</p>
        <p><a href="${link}">Potvrdi email →</a></p>
        <p>Link važi 24 sata. Ako niste vi tražili registraciju, zanemarite ovu poruku.</p>
        <p>— BrziMajstor.ME</p>
      `,
    });
    return { ok: true };
  } catch (e) {
    console.error("[email] sendEmailVerificationEmail Resend error", {
      to,
      message: e instanceof Error ? e.message.slice(0, 300) : String(e).slice(0, 300),
    });
    return {
      ok: false,
      code: "EMAIL_SEND_FAILED",
      error: "Slanje verifikacionog emaila nije uspjelo. Pokušajte kasnije.",
    };
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
        <p><a href="${appBaseUrl}/dashboard/handyman">Pogledaj profil →</a></p>
        <p>— BrziMajstor.ME</p>
      `,
    });
  } catch {
    // Silently fail - email is non-critical
  }
}
