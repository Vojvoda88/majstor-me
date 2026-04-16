/** Isti default kao `npm run dev` (`next dev -p 3010`) i `playwright.config.ts`. */
export const PLAYWRIGHT_DEFAULT_BASE_URL = "http://localhost:3010";

export function playwrightBaseURL(): string {
  return process.env.PLAYWRIGHT_BASE_URL?.trim() || PLAYWRIGHT_DEFAULT_BASE_URL;
}
