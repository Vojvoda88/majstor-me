/**
 * Kad zamijeniš public/launcher-icon-192.png ili launcher-icon-512.png, promijeni verziju da
 * preglednici i “Dodaj na početni ekran” povuku novu sliku umjesto starog keša.
 * Uskladi i public/sw.js: ICON_192 i po potrebi CACHE_NAME.
 */
export const PWA_ICON_CACHE_VERSION = "20260416-dfae30a7";

export function pwaIconSrc(size: 192 | 512): string {
  return `/launcher-icon-${size}.png?v=${PWA_ICON_CACHE_VERSION}`;
}
