export function SkeletonCard() {
  return (
    <div className="flex flex-col border border-border rounded-lg bg-canvas overflow-hidden animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video bg-hover" />

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {/* Title */}
        <div className="h-4 bg-hover rounded w-3/4" />

        {/* Summary lines */}
        <div className="space-y-1.5">
          <div className="h-3 bg-hover rounded w-full" />
          <div className="h-3 bg-hover rounded w-5/6" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-hover rounded" />
          <div className="h-5 w-10 bg-hover rounded" />
        </div>

        {/* Footer */}
        <div className="h-3 bg-hover rounded w-1/3" />
      </div>
    </div>
  )
}
