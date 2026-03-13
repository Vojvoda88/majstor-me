export default function UserDashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
