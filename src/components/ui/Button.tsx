import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed relative';

    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary:
        'bg-surface-700 hover:bg-surface-600 text-gray-200 border border-surface-600',
      danger: 'bg-danger-600 hover:bg-danger-700 text-white',
      ghost: 'bg-transparent hover:bg-surface-800 text-gray-300',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {loading && <Spinner size="sm" className="absolute" />}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
