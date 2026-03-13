export default function HandymanDashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="mb-4 flex gap-4">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
