/** Tekst obavještenja majstoru nakon što administracija prilagodi profil (kulturn ton). */

export type ModerationReasonCode = "PHONE_NUMBER" | "INAPPROPRIATE_CONTENT";

export function profileModerationNoticeTitle(): string {
  return "Vaš profil je ažuriran od strane administracije";
}

export function profileModerationNoticeBody(opts: {
  reason: ModerationReasonCode;
  changedBio: boolean;
  removedAvatar: boolean;
  removedGalleryCount: number;
}): string {
  const why =
    opts.reason === "PHONE_NUMBER"
      ? "dio sadržaja na vašem profilu prilagođen je jer nije bio u skladu s pravilima platforme — na primjer, javno objavljen broj telefona ili drugi kontakt podaci izvan predviđenih kanala na BrziMajstor.ME."
      : "dio sadržaja na vašem profilu prilagođen je jer je procijenjen kao neprimjeren pravilima zajednice i uslova korišćenja platforme.";

  const lines: string[] = [
    "Poštovani,",
    "",
    why,
    "",
  ];

  const bullets: string[] = [];
  if (opts.changedBio) {
    bullets.push("tekst opisa profila je izmijenjen ili skraćen kako bi bio u skladu s pravilima");
  }
  if (opts.removedAvatar) {
    bullets.push("uklonjena je profilna fotografija");
  }
  if (opts.removedGalleryCount === 1) {
    bullets.push("uklonjena je jedna fotografija iz galerije radova");
  } else if (opts.removedGalleryCount > 1) {
    bullets.push(`uklonjeno je ${opts.removedGalleryCount} fotografija iz galerije radova`);
  }

  if (bullets.length > 0) {
    lines.push("Šta je konkretno urađeno:");
    for (const b of bullets) {
      lines.push(`• ${b}`);
    }
    lines.push("");
  }

  lines.push(
    "Kontakt s klijentima ostvaruje se putem mehanizama predviđenih na platformi. Poštovanje pravila pomaže da okruženje ostane fer i sigurno za majstore i korisnike.",
    "",
    "Ako imate pitanja, rado ćemo odgovoriti putem stranice za kontakt.",
    "",
    "Srdačan pozdrav,",
    "Tim BrziMajstor.ME"
  );

  return lines.join("\n");
}
