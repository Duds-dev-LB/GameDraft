import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`w-full bg-surface-800 border ${
              error ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-600 focus:ring-primary-500'
            } rounded-lg px-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <span className="text-sm text-danger-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
