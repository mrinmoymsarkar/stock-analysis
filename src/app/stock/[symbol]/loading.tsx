export default function StockLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Price + key stats skeleton */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="h-[300px] bg-muted rounded animate-pulse" />
      </div>

      {/* News skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
