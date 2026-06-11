"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePublicCta } from "@/hooks/use-public-cta";

export function NotFoundRequestCta() {
  const { primaryCta } = usePublicCta();
  return (
    <Link href={primaryCta.href}>
      <Button
        variant="outline"
        className="h-11 px-6 text-sm font-semibold text-[#0F172A] sm:h-12 sm:px-7"
      >
        {primaryCta.label}
      </Button>
    </Link>
  );
}
