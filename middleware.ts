import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  getLocaleFromPathname,
  isExcludedFromLocaleRouting,
  normalizeLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from "@/lib/i18n/config";

function getPreferredLocale(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie) return normalizeLocale(cookie);
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isExcludedFromLocaleRouting(pathname)) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPathname(pathname);
  if (!localeFromPath) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = withLocalePrefix(pathname, locale);
    url.search = search;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const strippedPath = stripLocalePrefix(pathname);
  if (isExcludedFromLocaleRouting(strippedPath)) {
    return NextResponse.redirect(new URL(`${strippedPath}${search}`, request.url));
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = strippedPath;
  rewrittenUrl.search = search;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, localeFromPath);

  const response = NextResponse.rewrite(rewrittenUrl, {
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(LOCALE_COOKIE, localeFromPath, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
