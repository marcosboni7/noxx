export const SkeletonCard = () => (
  <div className="group relative p-2 border border-green-500/5 bg-zinc-900/20 animate-pulse">
    <div className="aspect-video bg-zinc-800 mb-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
    <div className="space-y-2">
      <div className="h-2 w-20 bg-zinc-800 rounded" />
      <div className="h-3 w-full bg-zinc-800 rounded" />
      <div className="h-2 w-16 bg-zinc-800 rounded" />
    </div>
  </div>
);