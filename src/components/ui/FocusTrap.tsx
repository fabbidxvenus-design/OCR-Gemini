import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface FocusTrapProps {
  active: boolean;
  children: ReactNode;
  className?: string;
  onEscape?: () => void;
  restoreFocusRef?: React.RefObject<HTMLElement | null>;
  role?: string;
  ariaModal?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  id?: string;
}

export default function FocusTrap({
  active,
  children,
  className,
  onEscape,
  restoreFocusRef,
  role,
  ariaModal,
  ariaLabelledBy,
  ariaDescribedBy,
  id,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = containerRef.current;
    const focusable = Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
    const firstFocusable = focusable[0] ?? container;
    firstFocusable?.focus();

    const restoreTarget = restoreFocusRef?.current ?? previousFocusRef.current;
    return () => {
      restoreTarget?.focus();
    };
  }, [active, restoreFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
    if (focusable.length === 0) {
      event.preventDefault();
      containerRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={className}
      role={role}
      aria-modal={ariaModal}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
}
