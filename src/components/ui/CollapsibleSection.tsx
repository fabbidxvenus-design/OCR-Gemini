import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  title,
  count,
  defaultExpanded = true,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(defaultExpanded ? undefined : 0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, children]);

  return (
    <div className={`bg-card border border-card-border rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-12 px-4 flex items-center justify-between bg-surface/50 hover:bg-surface transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-label uppercase tracking-wide text-text-secondary">
            {title} ({count})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-card-border rounded text-label text-text-secondary">
            {count}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          )}
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: contentHeight ? `${contentHeight}px` : 'none' }}
      >
        <div ref={contentRef} className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
