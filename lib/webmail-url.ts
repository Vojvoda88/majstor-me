/**
 * URL web-pošte za poznate domene — da korisnik jednim klikom otvori inbox u pregledaču.
 */
export function getWebmailInboxLink(email: string): { url: string; label: string } | null {
  const at = email.indexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return null;

  const exact: Record<string, { url: string; label: string }> = {
    "gmail.com": { url: "https://mail.google.com/mail/u/0/#inbox", label: "Gmail" },
    "googlemail.com": { url: "https://mail.google.com/mail/u/0/#inbox", label: "Gmail" },
    "outlook.com": { url: "https://outlook.live.com/mail/0/inbox", label: "Outlook" },
    "hotmail.com": { url: "https://outlook.live.com/mail/0/inbox", label: "Outlook" },
    "live.com": { url: "https://outlook.live.com/mail/0/inbox", label: "Outlook" },
    "msn.com": { url: "https://outlook.live.com/mail/0/inbox", label: "Outlook" },
    "yahoo.com": { url: "https://mail.yahoo.com/", label: "Yahoo Mail" },
    "yahoo.co.uk": { url: "https://mail.yahoo.co.uk/", label: "Yahoo Mail" },
    "icloud.com": { url: "https://www.icloud.com/mail", label: "iCloud Mail" },
    "me.com": { url: "https://www.icloud.com/mail", label: "iCloud Mail" },
    "mac.com": { url: "https://www.icloud.com/mail", label: "iCloud Mail" },
    "proton.me": { url: "https://mail.proton.me/", label: "Proton Mail" },
    "protonmail.com": { url: "https://mail.proton.me/", label: "Proton Mail" },
    "tutanota.com": { url: "https://mail.tutanota.com/", label: "Tutanota" },
    "tutamail.com": { url: "https://mail.tutanota.com/", label: "Tutanota" },
    "yandex.ru": { url: "https://mail.yandex.ru/", label: "Yandex" },
    "yandex.com": { url: "https://mail.yandex.com/", label: "Yandex" },
    "mail.ru": { url: "https://mail.ru/", label: "Mail.ru" },
  };

  return exact[domain] ?? null;
}
