import { readFileSync } from "node:fs";
import { join } from "node:path";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const LOCALES = ["sr", "en", "ru", "tr"] as const;
const BASE_LOCALE = "sr";

function readJson(path: string): JsonValue {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as JsonValue;
}

function collectKeys(value: JsonValue, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectKeys(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return collectKeys(child, next);
    });
  }
  return prefix ? [prefix] : [];
}

function asSet(values: string[]): Set<string> {
  return new Set(values);
}

function diff(base: Set<string>, target: Set<string>) {
  const missing = Array.from(base).filter((k) => !target.has(k));
  const extra = Array.from(target).filter((k) => !base.has(k));
  return { missing, extra };
}

function main() {
  const root = process.cwd();
  const localeData = new Map<string, Set<string>>();

  for (const locale of LOCALES) {
    const file = join(root, "messages", `${locale}.json`);
    try {
      const json = readJson(file);
      localeData.set(locale, asSet(collectKeys(json)));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[verify:i18n-keys] Failed to parse ${file}: ${message}`);
      process.exit(1);
    }
  }

  const base = localeData.get(BASE_LOCALE);
  if (!base) {
    console.error(`[verify:i18n-keys] Missing base locale: ${BASE_LOCALE}`);
    process.exit(1);
  }

  let hasErrors = false;
  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) continue;
    const target = localeData.get(locale);
    if (!target) {
      hasErrors = true;
      console.error(`[verify:i18n-keys] Missing locale data for ${locale}`);
      continue;
    }

    const { missing, extra } = diff(base, target);
    if (missing.length || extra.length) {
      hasErrors = true;
      console.error(`\n[verify:i18n-keys] Locale ${locale} is out of sync with ${BASE_LOCALE}.`);
      if (missing.length) {
        console.error(`- Missing keys (${missing.length}):`);
        missing.slice(0, 30).forEach((k) => console.error(`  - ${k}`));
      }
      if (extra.length) {
        console.error(`- Extra keys (${extra.length}):`);
        extra.slice(0, 30).forEach((k) => console.error(`  - ${k}`));
      }
    }
  }

  if (hasErrors) {
    console.error("\n[verify:i18n-keys] FAILED");
    process.exit(1);
  }

  console.log("[verify:i18n-keys] OK");
}

main();
