import { FAQ_ITEMS } from "@/lib/faq-data";
import type { FaqItem } from "@/lib/json-ld";

export type PublicFaqItem = FaqItem;

/** Aktivne FAQ stavke iz baze; ako nema redova, koristi statički fallback. */
export async function getActiveFaqItems(): Promise<PublicFaqItem[]> {
  try {
    const { prisma } = await import("@/lib/db");
    const rows = await prisma.faqItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { question: true, answer: true },
    });
    if (rows.length === 0) return FAQ_ITEMS;
    return rows.map((r) => ({ q: r.question, a: r.answer }));
  } catch {
    return FAQ_ITEMS;
  }
}
