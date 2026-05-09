import Link from "next/link";

type AdminListPaginationProps = {
  page: number;
  totalPages: number;
  prevHref?: string;
  nextHref?: string;
};

export function AdminListPagination({ page, totalPages, prevHref, nextHref }: AdminListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
      {prevHref ? (
        <Link href={prevHref} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
          ← Prethodna
        </Link>
      ) : null}
      <span className="px-2 text-sm font-medium text-[#64748B]">
        Strana {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Sljedeća →
        </Link>
      ) : null}
    </div>
  );
}
