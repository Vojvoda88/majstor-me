import { notFound, permanentRedirect } from "next/navigation";
import { parseCategoryCitySlug } from "@/lib/slugs";

/**
 * Stari format jednog segmenta ({slug}-{grad}) — trajni preusmjeravanje na /{usluga}/{grad}.
 */
export default async function LegacySeoLandingRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseCategoryCitySlug(slug);
  if (!parsed) notFound();
  permanentRedirect(`/${parsed.categorySlug}/${parsed.citySlug}`);
}
