"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePublicCta } from "@/hooks/use-public-cta";

export function ProblemiRequestCta({ createUrl }: { createUrl: string }) {
  const { primaryCta } = usePublicCta(createUrl);
  return (
    <Link
      href={primaryCta.href}
      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 py-3.5 text-base font-bold text-white shadow-btn-cta transition hover:brightness-105"
    >
      {primaryCta.label}
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
