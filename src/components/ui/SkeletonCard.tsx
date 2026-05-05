interface SkeletonCardProps {
  showImage?: boolean;
  className?: string;
}

export default function SkeletonCard({ showImage = true, className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex gap-3">
        {showImage && (
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
