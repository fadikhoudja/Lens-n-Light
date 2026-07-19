function GallerySkeleton() {
  return (
    <div className="pt-24 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-warm/10 rounded animate-pulse" />
          <div className="h-4 w-64 bg-warm/5 rounded animate-pulse" />
        </div>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="bg-warm/5 aspect-[4/3] rounded-sm" />
            <div className="mt-2 h-4 w-3/4 bg-warm/5 rounded" />
            <div className="mt-1 h-3 w-1/3 bg-warm/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default GallerySkeleton;
