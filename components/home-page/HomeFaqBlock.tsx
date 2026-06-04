"use client";

import { FAQ } from "@/components/home-page/FAQ";
import type { FaqItem } from "@/lib/json-ld";

export function HomeFaqBlock({ items }: { items: FaqItem[] }) {
  return <FAQ items={items} />;
}
