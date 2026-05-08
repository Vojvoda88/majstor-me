"use client";

import { useEffect, useState } from "react";

export type UiLanguage = "sr" | "en" | "ru" | "tr";

const SUPPORTED: UiLanguage[] = ["sr", "en", "ru", "tr"];

function normalizeLanguage(value: string | undefined | null): UiLanguage {
  if (!value) return "sr";
  const lower = value.toLowerCase();
  if (SUPPORTED.includes(lower as UiLanguage)) return lower as UiLanguage;
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("tr")) return "tr";
  return "sr";
}

function readGoogleTranslateCookie(): UiLanguage | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("googtrans="))
    ?.split("=")[1];
  if (!cookie) return null;
  const decoded = decodeURIComponent(cookie);
  const target = decoded.split("/").at(-1);
  return normalizeLanguage(target);
}

function readHtmlLanguage(): UiLanguage {
  if (typeof document === "undefined") return "sr";
  return normalizeLanguage(document.documentElement.lang);
}

export function detectUiLanguage(): UiLanguage {
  return readGoogleTranslateCookie() ?? readHtmlLanguage();
}

export function useUiLanguage(): UiLanguage {
  const [language, setLanguage] = useState<UiLanguage>("sr");

  useEffect(() => {
    const update = () => setLanguage(detectUiLanguage());
    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, []);

  return language;
}
