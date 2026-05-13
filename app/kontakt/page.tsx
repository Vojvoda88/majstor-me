import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Mail, Phone, ArrowLeft, MessageCircleMore } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  getSupportEmail,
  getSupportMailtoHref,
  getSupportPhone,
  getSupportViberHref,
  getSupportWhatsappHref,
} from "@/lib/support-contact";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";
import { SEO_OG_IMAGE_PATH } from "@/lib/seo-brand";
import { buildAlternates, getLocaleFromHeaderValue, LOCALE_HEADER, localizedPath } from "@/lib/i18n/seo";
import type { AppLocale } from "@/lib/i18n/config";

const baseUrl = getSiteUrl().replace(/\/$/, "");

const CONTACT_COPY: Record<
  AppLocale,
  {
    metadataTitle: string;
    metadataDescription: string;
    backHome: string;
    heading: string;
    intro: string;
    emailLabel: string;
    emailCta: string;
    phoneLabel: string;
    viberCta: string;
    whatsappCta: string;
    fastContactTitle: string;
    fastContactBody: string;
    securityNote: string;
  }
> = {
  sr: {
    metadataTitle: "Kontakt i podrska",
    metadataDescription: "Pitanja za tim BrziMajstor.ME - korisnici, majstori, tehnicka podrska.",
    backHome: "Nazad na pocetnu",
    heading: "Kontakt i podrska",
    intro:
      "Za pitanja oko naloga, oglasa, kredita ili tehnickog problema javite se putem emaila, poziva, Vibera ili WhatsApp-a - isti broj vazi za sve tri aplikacije.",
    emailLabel: "Email",
    emailCta: "Posalji poruku (otvara email)",
    phoneLabel: "Telefon (poziv, Viber, WhatsApp)",
    viberCta: "Pisi na Viber",
    whatsappCta: "Pisi na WhatsApp",
    fastContactTitle: "Kako najbrze da nam pisete",
    fastContactBody:
      "Posaljite kratko sta nije jasno, broj oglasa ako postoji i screenshot ako imate tehnicki problem.",
    securityNote:
      "Za hitne sigurnosne prijave koristite isti email i jasno navedite \"sigurnost\" u naslovu. Ako ste izgubili link za guest oglas, u poruci navedite grad i kratak opis zahtjeva - mozemo vam poslati novi pristupni link nakon provjere.",
  },
  en: {
    metadataTitle: "Contact and support",
    metadataDescription: "Questions for the BrziMajstor.ME team - users, handymen, technical support.",
    backHome: "Back to home",
    heading: "Contact and support",
    intro:
      "For account, request, credits, or technical questions, contact us by email, phone call, Viber, or WhatsApp - the same number is valid for all three channels.",
    emailLabel: "Email",
    emailCta: "Send message (opens email)",
    phoneLabel: "Phone (call, Viber, WhatsApp)",
    viberCta: "Message on Viber",
    whatsappCta: "Message on WhatsApp",
    fastContactTitle: "How to contact us fastest",
    fastContactBody:
      "Send a short description of what is unclear, include request ID if available, and attach a screenshot for technical issues.",
    securityNote:
      "For urgent security reports, use the same email and include \"security\" in the subject. If you lost your guest request link, include city and a short request description - we can send a new access link after verification.",
  },
  ru: {
    metadataTitle: "Kontakty i podderzhka",
    metadataDescription: "Voprosy komande BrziMajstor.ME - klienty, mastera, tekhnicheskaya podderzhka.",
    backHome: "Nazad domoy",
    heading: "Kontakty i podderzhka",
    intro:
      "Po voprosam akkaunta, zayavki, kreditov ili tekhnicheskikh problemov svyazhites s nami po email, zvonku, Viber ili WhatsApp - odin i tot zhe nomer dlya vsekh trekh kanalov.",
    emailLabel: "Email",
    emailCta: "Otpravit soobshchenie (otkryvaet email)",
    phoneLabel: "Telefon (zvonok, Viber, WhatsApp)",
    viberCta: "Napisat v Viber",
    whatsappCta: "Napisat v WhatsApp",
    fastContactTitle: "Kak svyazatsya s nami bystree vsego",
    fastContactBody:
      "Kratko opishite problem, dobavte nomer zayavki esli est i prilozhite screenshot pri tekhnicheskoy oshibke.",
    securityNote:
      "Dlya srochnykh voprosov bezopasnosti ispolzuyte tot zhe email i ukazhite \"security\" v teme. Esli vy poteryali ssylku na gostevuyu zayavku, ukazhite gorod i kratkoe opisanie - my otpravim novuyu ssylku posle proverki.",
  },
  tr: {
    metadataTitle: "Iletisim ve destek",
    metadataDescription: "BrziMajstor.ME ekibine sorular - kullanicilar, ustalar, teknik destek.",
    backHome: "Ana sayfaya don",
    heading: "Iletisim ve destek",
    intro:
      "Hesap, is talebi, kredi veya teknik sorunlar icin bize email, telefon, Viber veya WhatsApp ile ulasin - ayni numara uc kanal icin de gecerlidir.",
    emailLabel: "Email",
    emailCta: "Mesaj gonder (email acilir)",
    phoneLabel: "Telefon (arama, Viber, WhatsApp)",
    viberCta: "Viber'dan yaz",
    whatsappCta: "WhatsApp'tan yaz",
    fastContactTitle: "Bize en hizli nasil ulasirsiniz",
    fastContactBody:
      "Kisa bir aciklama gonderin, varsa talep numarasini ekleyin ve teknik sorunlarda ekran goruntusu paylasin.",
    securityNote:
      "Acil guvenlik bildirimleri icin ayni email adresini kullanin ve konuya \"security\" yazin. Misafir talep linkinizi kaybettiyseniz sehir ve kisa talep aciklamasi gonderin - dogrulamadan sonra yeni erisim linki paylasabiliriz.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocaleFromHeaderValue(headers().get(LOCALE_HEADER));
  const copy = CONTACT_COPY[locale];
  const localizedUrl = `${baseUrl}${localizedPath("/kontakt", locale)}`;
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    robots: { index: true, follow: true },
    alternates: buildAlternates(baseUrl, "/kontakt", locale),
    openGraph: {
      title: `${copy.metadataTitle} | BrziMajstor.ME`,
      description: copy.metadataDescription,
      url: localizedUrl,
      siteName: "BrziMajstor.ME",
      type: "website",
      images: [SEO_OG_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image",
      title: `${copy.metadataTitle} | BrziMajstor.ME`,
      description: copy.metadataDescription,
      images: [SEO_OG_IMAGE_PATH],
    },
  };
}

export default async function KontaktPage() {
  const locale = getLocaleFromHeaderValue(headers().get(LOCALE_HEADER));
  const copy = CONTACT_COPY[locale];
  const email = getSupportEmail();
  const phone = getSupportPhone();
  const mailto = getSupportMailtoHref();
  const whatsapp = getSupportWhatsappHref();
  const viber = getSupportViberHref();

  return (
    <div className="min-h-screen bg-brand-page pb-16 pt-16 md:pb-10 md:pt-20">
      <PublicHeader />
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#1d4ed8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {copy.backHome}
        </Link>

        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{copy.heading}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          {copy.intro}
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8]/10 text-[#1d4ed8]">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{copy.emailLabel}</p>
              <a href={`mailto:${email}`} className="mt-0.5 block break-all text-[15px] text-[#1d4ed8] hover:underline">
                {email}
              </a>
              <Button asChild className="mt-3 w-full sm:w-auto">
                <a href={mailto}>{copy.emailCta}</a>
              </Button>
            </div>
          </div>

          {phone && (
            <div className="flex gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <Phone className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{copy.phoneLabel}</p>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-0.5 block text-[15px] text-[#1d4ed8] hover:underline">
                  {phone}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  {viber && (
                    <Button asChild variant="outline" className="border-slate-200 bg-white">
                      <a href={viber}>{copy.viberCta}</a>
                    </Button>
                  )}
                  {whatsapp && (
                    <Button asChild variant="outline" className="border-slate-200 bg-white">
                      <a href={whatsapp} target="_blank" rel="noreferrer">
                        {copy.whatsappCta}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
              <MessageCircleMore className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{copy.fastContactTitle}</p>
              <p className="mt-0.5 text-[15px] leading-relaxed text-slate-600">
                {copy.fastContactBody}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          {copy.securityNote}
        </p>
      </div>
      <PublicFooter />
    </div>
  );
}
