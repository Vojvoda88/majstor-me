import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/messages";

export const HANDYMAN_JOBS_HREF = "/dashboard/handyman";
export const HANDYMAN_OFFERS_HREF = "/dashboard/handyman/offers";

export type SessionRole = "USER" | "HANDYMAN" | "ADMIN" | string | undefined | null;

export function isLoggedInHandyman(role: SessionRole, authenticated = true): boolean {
  return authenticated && role === "HANDYMAN";
}

export function getPublicPrimaryCta(
  locale: AppLocale,
  options: { role?: SessionRole; authenticated?: boolean; requestHref?: string }
): { href: string; label: string } {
  if (isLoggedInHandyman(options.role, options.authenticated ?? true)) {
    return {
      href: HANDYMAN_JOBS_HREF,
      label: t(locale, "home.hero.availableJobsCta", "Dostupni poslovi"),
    };
  }
  return {
    href: options.requestHref ?? "/request/create",
    label: t(locale, "navigation.requestHandyman", "Zatraži majstora"),
  };
}

export function getPublicSecondaryCta(
  locale: AppLocale,
  options: { role?: SessionRole; authenticated?: boolean }
): { href: string; label: string } | null {
  if (isLoggedInHandyman(options.role, options.authenticated ?? true)) {
    return {
      href: HANDYMAN_OFFERS_HREF,
      label: t(locale, "home.hero.myOffersCta", "Moje ponude"),
    };
  }
  if (options.authenticated && options.role === "USER") {
    return {
      href: "/dashboard/user",
      label: t(locale, "home.hero.myRequestsCta", "Moji zahtjevi"),
    };
  }
  return null;
}

export function getHandymanRegisterCta(
  locale: AppLocale,
  options: { role?: SessionRole; authenticated?: boolean }
): { href: string; label: string } | null {
  if (options.authenticated) {
    if (options.role === "HANDYMAN") {
      return {
        href: HANDYMAN_JOBS_HREF,
        label: t(locale, "home.hero.availableJobsCta", "Dostupni poslovi"),
      };
    }
    return null;
  }
  return {
    href: "/register?type=majstor",
    label: t(locale, "navigation.forHandymen", "Registruj se kao majstor"),
  };
}

export type FooterNavItem = { href: string; labelKey: string; fallback: string };

const GUEST_FOOTER_NAV: FooterNavItem[] = [
  { href: "/", labelKey: "navigation.home", fallback: "Početna" },
  { href: "/categories", labelKey: "navigation.categories", fallback: "Kategorije" },
  { href: "/request/create", labelKey: "navigation.requestHandyman", fallback: "Zatraži majstora" },
  { href: "/#kako-radi", labelKey: "navigation.howItWorks", fallback: "Kako funkcioniše" },
  { href: "/register?type=majstor", labelKey: "navigation.forHandymen", fallback: "Za majstore" },
  { href: "/#faq", labelKey: "navigation.faq", fallback: "Česta pitanja" },
  { href: "/instaliraj", labelKey: "navigation.installApp", fallback: "Instaliraj aplikaciju" },
  { href: "/kontakt", labelKey: "navigation.support", fallback: "Kontakt i podrška" },
];

export function getFooterNavItems(
  role: SessionRole,
  authenticated: boolean
): FooterNavItem[] {
  if (!isLoggedInHandyman(role, authenticated)) {
    return GUEST_FOOTER_NAV;
  }
  return GUEST_FOOTER_NAV.map((item) => {
    if (item.href === "/request/create") {
      return {
        href: HANDYMAN_JOBS_HREF,
        labelKey: "home.hero.availableJobsCta",
        fallback: "Dostupni poslovi",
      };
    }
    if (item.href === "/register?type=majstor") {
      return {
        href: HANDYMAN_OFFERS_HREF,
        labelKey: "home.hero.myOffersCta",
        fallback: "Moje ponude",
      };
    }
    return item;
  });
}
