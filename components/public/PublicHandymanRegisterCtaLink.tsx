"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePublicCta } from "@/hooks/use-public-cta";

type Props = Omit<ComponentProps<typeof Link>, "href">;

export function PublicHandymanRegisterCtaLink({ children, ...props }: Props) {
  const { registerCta } = usePublicCta();
  if (!registerCta) return null;
  return (
    <Link href={registerCta.href} {...props}>
      {children ?? registerCta.label}
    </Link>
  );
}
