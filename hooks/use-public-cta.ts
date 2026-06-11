"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import {
  getHandymanRegisterCta,
  getPublicPrimaryCta,
  getPublicSecondaryCta,
  isLoggedInHandyman,
} from "@/lib/handyman-public-cta";

export function usePublicCta(requestHref?: string) {
  const locale = useUiLanguage();
  const { data: session, status } = useSession();
  const authenticated = status === "authenticated";
  const role = session?.user?.role;

  return useMemo(() => {
    const opts = { role, authenticated, requestHref };
    return {
      isHandyman: isLoggedInHandyman(role, authenticated),
      primaryCta: getPublicPrimaryCta(locale, opts),
      secondaryCta: getPublicSecondaryCta(locale, opts),
      registerCta: getHandymanRegisterCta(locale, opts),
    };
  }, [authenticated, locale, requestHref, role]);
}
