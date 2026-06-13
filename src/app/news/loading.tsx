export default function NewsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page heading skeleton */}
      <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />

      {/* News item skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 space-y-2"
          >
            {/* Thumbnail + content row */}
            <div className="flex gap-3">
              <div className="shrink-0 h-16 w-16 bg-muted rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
