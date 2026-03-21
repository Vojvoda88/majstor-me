"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreditPackage } from "@/lib/credit-packages";
import { trackFunnel } from "@/lib/track-funnel";

type ButtonVariant = "default" | "premium";

export function CreditsPurchaseButton({
  pkg,
  variant = "default",
}: {
  pkg: CreditPackage;
  variant?: ButtonVariant;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    trackFunnel("credit_package_selected", { packageId: pkg.id, credits: pkg.credits });
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const json = await res.json();
      if (json.success && json.checkoutUrl) {
        trackFunnel("credit_purchase_started", { packageId: pkg.id });
        window.location.href = json.checkoutUrl;
        return;
      }
      alert(json.error ?? "Greška");
    } catch {
      alert("Greška pri kreiranju plaćanja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      size="lg"
      className={cn(
        "w-full min-h-[48px] text-base font-semibold transition-shadow",
        variant === "premium" &&
          "border-slate-800 !bg-slate-900 !text-white shadow-[0_8px_28px_-12px_rgba(15,23,42,0.45)] hover:!bg-slate-800 hover:!text-white",
        variant === "default" && "border-slate-200 bg-white hover:bg-slate-50"
      )}
    >
      {loading ? "Učitavanje…" : `Kupi za ${pkg.priceEur.toFixed(2)} €`}
    </Button>
  );
}
