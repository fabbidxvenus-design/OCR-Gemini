import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ARSectionProps {
  rawText?: string;
}

/**
 * Collapsible AR (Raw OCR) section
 */
export default function ARSection({ rawText }: ARSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!rawText) return null;

  return (
    <div className="border-t border-card-border pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-small font-medium text-text-secondary hover:text-text-primary"
        aria-expanded={isExpanded}
      >
        <span>AR - Text OCR thô</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 rounded-lg bg-surface p-3">
          <pre className="whitespace-pre-wrap text-caption text-text-secondary font-mono overflow-x-auto">
            {rawText}
          </pre>
        </div>
      )}
    </div>
  );
}