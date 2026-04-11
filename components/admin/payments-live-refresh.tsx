"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Lagano osvježavanje liste (webhook već upisuje u DB — nema direktnog "live" povlačenja sa Stripe API-ja).
 */
export function PaymentsLiveRefresh({ intervalMs = 45_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return (
    <p className="text-xs text-[#64748B]">
      Lista se automatski osvježava svakih ~{Math.round(intervalMs / 1000)} s dok je kartica otvorena. Za trenutne uplate na Stripe nalogu koristi{" "}
      <a
        href="https://stripe.com/docs/dashboard/mobile"
        className="font-medium text-violet-700 underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Stripe mobilnu aplikaciju
      </a>{" "}
      (push obavještenja od Stripea).
    </p>
  );
}
