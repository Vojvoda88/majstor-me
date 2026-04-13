/**
 * Kad zamijeniš public/icon-192.png ili icon-512.png, promijeni verziju da
 * preglednici i “Dodaj na početni ekran” povuku novu sliku umjesto starog keša.
 * Uskladi i public/sw.js: ICON_192 i po potrebi CACHE_NAME.
 */
export const PWA_ICON_CACHE_VERSION = "20260413-house";

export function pwaIconSrc(size: 192 | 512): string {
  return `/icon-${size}.png?v=${PWA_ICON_CACHE_VERSION}`;
}
