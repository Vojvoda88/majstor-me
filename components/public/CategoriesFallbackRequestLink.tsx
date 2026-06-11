"use client";

import Link from "next/link";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/categories";
import { usePublicCta } from "@/hooks/use-public-cta";

export function CategoriesFallbackRequestLink() {
  const requestHref = `/request/create?category=${encodeURIComponent(REQUEST_CATEGORY_FALLBACK)}`;
  const { primaryCta, isHandyman } = usePublicCta(requestHref);
  return (
    <Link
      href={primaryCta.href}
      className="font-semibold text-blue-700 underline-offset-2 hover:underline"
    >
      {isHandyman ? primaryCta.label : "Ne vidiš svoju uslugu?"}
    </Link>
  );
}
