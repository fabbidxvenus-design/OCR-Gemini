import { ButtonHTMLAttributes, forwardRef } from 'react';
import Spinner from './Spinner';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'lg';
  loading?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-surface text-text-primary border border-card-border hover:bg-gray-50',
      danger: 'bg-error-light text-error border border-error-border hover:bg-red-100',
    };

    const sizeStyles = {
      md: 'h-btn px-4 rounded-xl text-small',
      lg: 'h-btn-primary px-6 rounded-xl text-body',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2 border-current border-t-transparent" data-testid="primary-button-loading-spinner" />}
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
