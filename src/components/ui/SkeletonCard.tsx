interface SkeletonCardProps {
  showImage?: boolean;
  className?: string;
  'data-testid'?: string;
}

export default function SkeletonCard({ showImage = true, className = '', 'data-testid': testId }: SkeletonCardProps) {
  const testProps = testId ? { 'data-testid': testId } : {};

  return (
    <div className={`bg-card rounded-2xl border border-card-border p-card shadow-card animate-pulse ${className}`} {...testProps}>
      <div className="flex gap-3">
        {showImage && (
          <div className="w-20 h-20 bg-surface rounded-xl flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2.5">
          <div className="h-5 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-1/2" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 bg-surface rounded w-14" />
            <div className="h-4 bg-surface rounded w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}