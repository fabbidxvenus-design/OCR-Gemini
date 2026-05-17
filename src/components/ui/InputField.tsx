import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, touched, className = '', id, ...props }, ref) => {
    const hasError = touched && error;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label uppercase tracking-wide text-text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-btn px-4 bg-card border rounded-sm text-body text-text-primary placeholder:text-text-placeholder
            transition-all duration-200
            ${hasError
              ? 'border-error ring-2 ring-error/20 focus:border-error focus:ring-error/20'
              : 'border-card-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none'
            }
            ${className}
          `}
          {...props}
        />
        {hasError && (
          <div
            className="flex items-center gap-2 mt-2 px-3 py-2 bg-error-light border border-error-border rounded-sm"
            role="alert"
            aria-live="polite"
          >
            <svg className="w-4 h-4 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-small text-error-text">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

interface PasswordInputProps extends Omit<InputFieldProps, 'type'> {
  showStrength?: boolean;
  strengthLevel?: 'weak' | 'medium' | 'strong';
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', showStrength, strengthLevel, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const strengthColors = {
      weak: 'bg-error',
      medium: 'bg-warning',
      strong: 'bg-success',
    };

    const strengthWidths = {
      weak: 'w-2/5',
      medium: 'w-3/5',
      strong: 'w-full',
    };

    return (
      <div className="w-full">
        <div className="relative">
          <InputField
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`pr-12 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-sm transition-colors"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {showStrength && strengthLevel && (
          <div className="mt-2">
            <div className="h-1 bg-card-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthColors[strengthLevel]} ${strengthWidths[strengthLevel]}`}
              />
            </div>
            <p className={`text-label mt-1 text-right ${strengthLevel === 'weak' ? 'text-error' : strengthLevel === 'medium' ? 'text-warning' : 'text-success'}`}>
              {strengthLevel === 'weak' ? 'Yếu' : strengthLevel === 'medium' ? 'Trung bình' : 'Mạnh'}
            </p>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
