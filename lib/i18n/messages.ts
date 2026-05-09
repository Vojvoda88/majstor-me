import type { AppLocale } from "@/lib/i18n/config";
import sr from "@/messages/sr.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import tr from "@/messages/tr.json";

type MessageValue = string | MessageValue[] | { [key: string]: MessageValue };
type MessageTree = { [key: string]: MessageValue };

const DICTIONARIES: Record<AppLocale, MessageTree> = {
  sr,
  en,
  ru,
  tr,
};

function getByPath(obj: MessageTree, path: string): string | null {
  const parts = path.split(".");
  let current: MessageValue | undefined = obj;
  for (const part of parts) {
    if (!current || typeof current === "string" || Array.isArray(current)) return null;
    current = current[part];
  }
  return typeof current === "string" ? current : null;
}

export function t(locale: AppLocale, key: string, fallback?: string): string {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES.sr;
  return getByPath(dict, key) ?? fallback ?? key;
}

export function getMessages(locale: AppLocale): MessageTree {
  return DICTIONARIES[locale] ?? DICTIONARIES.sr;
}
