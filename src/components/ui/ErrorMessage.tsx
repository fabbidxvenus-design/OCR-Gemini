import { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export default function ErrorMessage({
  title,
  message,
  onRetry,
  className = '',
  autoFocus = false
}: ErrorMessageProps) {
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    if (retryButtonRef.current) {
      retryButtonRef.current.focus();
      return;
    }
    alertRef.current?.focus();
  }, [autoFocus]);

  return (
    <div ref={alertRef} className={`flex flex-col items-center justify-center p-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`} role="alert" tabIndex={-1}>
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-error" aria-hidden="true" />
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      )}
      <p className="text-neutral text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          ref={retryButtonRef}
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Thử lại
        </button>
      )}
    </div>
  );
}