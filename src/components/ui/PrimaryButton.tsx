import { ButtonHTMLAttributes, forwardRef } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'lg';
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

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
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
