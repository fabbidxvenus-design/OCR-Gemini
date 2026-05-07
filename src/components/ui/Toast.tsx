import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-card border ${
        type === 'success' ? 'bg-success-light border-success/20' : 'bg-error-light border-error/20'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === 'success' ? 'bg-success/10' : 'bg-error/10'
        }`}>
          {type === 'success' ? (
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <span className={`text-small font-medium flex-1 ${type === 'success' ? 'text-success' : 'text-error'}`}>
          {message}
        </span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <svg className={`w-4 h-4 ${type === 'success' ? 'text-success' : 'text-error'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}