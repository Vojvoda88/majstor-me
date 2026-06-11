"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePublicCta } from "@/hooks/use-public-cta";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  requestHref?: string;
};

export function PublicPrimaryCtaLink({ requestHref, children, ...props }: Props) {
  const { primaryCta } = usePublicCta(requestHref);
  return (
    <Link href={primaryCta.href} {...props}>
      {children ?? primaryCta.label}
    </Link>
  );
}
