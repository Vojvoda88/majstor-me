/**
 * Client-side funnel tracking – fire-and-forget fetch ka API-ju.
 */
import type { FunnelEventType } from "@/lib/funnel-events";

export function trackFunnel(
  event: FunnelEventType,
  metadata?: Record<string, string | number | boolean | undefined>
): void {
  try {
    void fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
      keepalive: true,
    });
  } catch {
    // Ignores errors
  }
}
