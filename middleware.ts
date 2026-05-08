import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getLocaleFromPathname,
  isExcludedFromLocaleRouting,
  stripLocalePrefix,
} from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isExcludedFromLocaleRouting(pathname)) {
    return NextResponse.next();
  }

  // Locale routing is prepared offline, but disabled in production UI until all translations are approved.
  // If a user still has /en, /ru, /tr or /sr from the previous rollout, return them to the canonical path.
  const localeFromPath = getLocaleFromPathname(pathname);
  if (localeFromPath) {
    const url = request.nextUrl.clone();
    url.pathname = stripLocalePrefix(pathname);
    url.search = search;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
