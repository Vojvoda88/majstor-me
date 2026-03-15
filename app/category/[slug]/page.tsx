import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";

export const revalidate = 3600;
import { getSiteUrl } from "@/lib/site-url";
import { CategoryPageContent } from "./category-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getCategoryBySlug(slug);
  if (!config) return { title: "Kategorija | Majstor.me" };
  const base = getSiteUrl();
  return {
    title: `${config.displayName} | Majstor.me`,
    description: `Pronađite ${config.displayName.toLowerCase()} u Crnoj Gori. Provjereni majstori, brze ponude.`,
    alternates: { canonical: `${base}/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getCategoryBySlug(slug);
  if (!config) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 p-8">Učitavanje...</div>}>
      <CategoryPageContent
        displayName={config.displayName}
        internalCategory={config.internalCategory}
        slug={slug}
      />
    </Suspense>
  );
}
