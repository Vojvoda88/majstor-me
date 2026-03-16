import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";

export const revalidate = 3600;
import { getSiteUrl } from "@/lib/site-url";
import { CategoryPageContent } from "./category-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategoryBySlug(slug);
  if (!config) {
    return {
      title: "Kategorija | Majstor.me",
      description: "Pregled kategorija majstora na Majstor.me platformi.",
    };
  }
  const base = getSiteUrl();
  const title = `${config.displayName} majstori u Crnoj Gori | Majstor.me`;
  const description = `Pregled majstora za kategoriju ${config.displayName.toLowerCase()} širom Crne Gore. Pronađite provjerenog majstora ili objavite besplatan zahtjev i dobijte ponude.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/category/${slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/category/${slug}`,
      type: "website",
    },
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
