import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CATEGORY_SLUGS } from "@/lib/slugs";
import { CategoryPageContent } from "./category-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CATEGORY_SLUGS[slug];
  if (!name) return { title: "Kategorija | Majstor.me" };
  return {
    title: `${name} | Majstor.me`,
    description: `Pronađite ${name.toLowerCase()} u Crnoj Gori. Provjereni majstori, brze ponude.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CATEGORY_SLUGS[slug];
  if (!name) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 p-8">Učitavanje...</div>}>
      <CategoryPageContent category={name} slug={slug} />
    </Suspense>
  );
}
