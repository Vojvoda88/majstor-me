import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedHandymanTile } from "./featured-handyman-tile";
import { ACTIVE_PUBLIC_CATEGORY_COUNT } from "@/lib/categories";
import type { PublicHandymanListItem } from "@/lib/handymen-listing";

type Props = { items: PublicHandymanListItem[] };

export function FeaturedHandymenSection({ items }: Props) {
  return (
    <section id="istaknuti-majstori" className="py-10 md:py-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:mb-10">
        <h2 className="max-w-2xl font-display text-[1.65rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl lg:text-[2.35rem]">
          Istaknuti majstori
        </h2>
        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-sm transition hover:border-blue-200 hover:bg-blue-50/80 md:px-5 md:py-3 md:text-[15px]"
        >
          Pogledaj sve kategorije
          <span className="tabular-nums text-slate-500">({ACTIVE_PUBLIC_CATEGORY_COUNT})</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 px-5 py-10 text-center md:px-8">
          <p className="text-base font-medium text-slate-700 md:text-lg">
            Trenutno nema javnih profila za prikaz. Pogledajte usluge po kategorijama ili pošaljite zahtjev —
            majstori će vam se javiti.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-navy/90"
            >
              Sve kategorije
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/request/create"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-brand-navy shadow-sm transition hover:border-blue-200 hover:bg-blue-50/80"
            >
              Zatraži majstora
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {items.map((item) => (
              <FeaturedHandymanTile key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-blue-50/40 px-5 py-8 text-center shadow-sm md:px-10 md:py-10">
            <p className="font-display text-lg font-bold tracking-tight text-brand-navy md:text-xl">
              Treba vam neki od ovih majstora?
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-600 md:text-base">
              Pošaljite kratak opis posla — odgovoriće majstori koji mogu da preuzmu rad.
            </p>
            <Link
              href="/request/create"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-navy px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-navy/90 md:text-[15px]"
            >
              Potraži majstora
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
