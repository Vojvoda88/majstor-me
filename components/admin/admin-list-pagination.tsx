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
    <div className="mt-4 flex items-center justify-center gap-2">
      {prevHref ? (
        <Link href={prevHref} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
          ← Prethodna
        </Link>
      ) : null}
      <span className="text-sm text-[#64748B]">
        Strana {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="rounded border px-3 py-1 text-sm hover:bg-slate-100">
          Sljedeća →
        </Link>
      ) : null}
    </div>
  );
}
