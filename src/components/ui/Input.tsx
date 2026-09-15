import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full bg-surface-800 border ${
            error ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-600 focus:ring-primary-500'
          } rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-danger-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
