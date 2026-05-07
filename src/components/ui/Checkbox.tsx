import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={inputId}
        className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
      >
        <div className="relative w-5 h-5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className="peer w-5 h-5 appearance-none border-2 border-card-border rounded bg-card cursor-pointer transition-all duration-200
              checked:bg-primary checked:border-primary
              focus:ring-2 focus:ring-primary/20 focus:outline-none focus:border-primary"
            {...props}
          />
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-check:opacity-100 transition-opacity pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-small text-text-primary">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
