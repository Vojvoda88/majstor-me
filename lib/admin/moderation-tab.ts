/**
 * Normalizacija ?tab= za /admin/moderation (Next 14: objekat, Next 15: Promise).
 * Sprječava prazan render ili crash ako `tab` nije string ili ako params nedostaju.
 */
export type ModerationTabId = "requests" | "workers" | "reports" | "spam";

const VALID_TABS: ModerationTabId[] = ["requests", "workers", "reports", "spam"];

export async function resolveModerationTab(
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>
): Promise<ModerationTabId> {
  const raw = await Promise.resolve(searchParams);
  const sp = raw && typeof raw === "object" ? raw : {};
  const tabParam = sp.tab;
  const tab = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  if (tab && VALID_TABS.includes(tab as ModerationTabId)) {
    return tab as ModerationTabId;
  }
  return "requests";
}
