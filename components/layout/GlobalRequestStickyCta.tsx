"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/i18n/config";
import { buildRequestCreateHref, isStickyRequestCtaPath } from "@/lib/build-request-create-href";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import { t } from "@/lib/i18n/messages";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";

const HOME_HERO_ID = "home-hero";

function isHeroInView(hero: HTMLElement): boolean {
  const rect = hero.getBoundingClientRect();
  // Dugme se skriva dok je i mali dio hero sekcije još u viewportu.
  return rect.bottom > 72;
}

/**
 * Sticky „Zatraži majstora“ na javnim stranicama (mobil).
 * Početna: nema dok je hero vidljiv; poslije hero sekcije — prikaže se.
 * Sve ostale javne stranice: uvijek vidljivo.
 */
export function GlobalRequestStickyCta() {
  const pathname = usePathname() || "/";
  const currentPath = stripLocalePrefix(pathname);
  const locale = useUiLanguage();
  const isHome = currentPath === "/";
  const enabled = isStickyRequestCtaPath(currentPath);
  const href = useMemo(() => buildRequestCreateHref(currentPath), [currentPath]);
  const label = t(locale, "navigation.requestHandyman", "Zatraži majstora");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    if (!isHome) {
      setVisible(true);
      return;
    }

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let hero: HTMLElement | null = null;

    const syncFromHero = () => {
      if (!hero) return;
      setVisible(!isHeroInView(hero));
    };

    const attach = (el: HTMLElement) => {
      hero = el;
      syncFromHero();

      observer = new IntersectionObserver(
        () => {
          if (!cancelled) syncFromHero();
        },
        { threshold: [0, 0.01, 0.1, 0.25, 0.5, 1] }
      );
      observer.observe(el);

      window.addEventListener("scroll", syncFromHero, { passive: true });
      window.addEventListener("resize", syncFromHero, { passive: true });
    };

    let waitTimer: ReturnType<typeof window.setInterval> | null = null;

    const existing = document.getElementById(HOME_HERO_ID);
    if (existing) {
      attach(existing);
    } else {
      setVisible(false);
      let attempts = 0;
      waitTimer = window.setInterval(() => {
        if (cancelled) return;
        attempts += 1;
        const el = document.getElementById(HOME_HERO_ID);
        if (el) {
          if (waitTimer) window.clearInterval(waitTimer);
          attach(el);
        } else if (attempts > 40 && waitTimer) {
          window.clearInterval(waitTimer);
        }
      }, 50);
    }

    return () => {
      cancelled = true;
      if (waitTimer) window.clearInterval(waitTimer);
      observer?.disconnect();
      window.removeEventListener("scroll", syncFromHero);
      window.removeEventListener("resize", syncFromHero);
    };
  }, [enabled, isHome, currentPath]);

  if (!enabled || !visible) return null;

  return <StickyBottomCTA href={href} label={label} />;
}
