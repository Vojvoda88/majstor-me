export default function GradLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mb-6 h-12 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mb-6 h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
