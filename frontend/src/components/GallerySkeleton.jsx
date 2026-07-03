function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-800/50 animate-pulse">
      <div className="w-full h-full bg-zinc-700/30" />
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="pt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-zinc-800/50 rounded animate-pulse" />
          </div>
          <div className="hidden md:flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-20 bg-zinc-800 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GallerySkeleton;
