interface SkeletonLineProps {
  className?: string;
  width?: string;
}

interface SkeletonBlockProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLine({ className = '', width = '100%' }: SkeletonLineProps) {
  return <div className={`animate-pulse rounded bg-surface h-4 ${className}`} style={{ width }} />;
}

export function SkeletonBlock({ className = '', width = '100%', height }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-xl bg-surface ${className}`} style={{ width, height }} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-production p-4 space-y-3 ${className}`}>
      <div className="flex gap-3">
        <div className="h-20 w-20 rounded-2xl bg-surface animate-pulse" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
        </div>
      </div>
      <SkeletonLine />
    </div>
  );
}