"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePublicCta } from "@/hooks/use-public-cta";

type Props = Omit<ComponentProps<typeof Link>, "href">;

export function PublicSecondaryCtaLink({ children, ...props }: Props) {
  const { secondaryCta } = usePublicCta();
  if (!secondaryCta) return null;
  return (
    <Link href={secondaryCta.href} {...props}>
      {children ?? secondaryCta.label}
    </Link>
  );
}
