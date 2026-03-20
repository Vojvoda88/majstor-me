"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CreditPackage } from "@/lib/credit-packages";
import { trackFunnel } from "@/lib/track-funnel";

export function CreditsPurchaseButton({ pkg }: { pkg: CreditPackage }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    trackFunnel("credit_package_selected", { packageId: pkg.id, credits: pkg.credits });
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      onClick={handleClick}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Učitavanje..." : `Kupi za ${pkg.priceEur.toFixed(2)} €`}
    </Button>
  );
}
