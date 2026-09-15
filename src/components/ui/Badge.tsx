import { ReactNode, FC } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-surface-700 text-gray-300',
    success: 'bg-accent-500/10 text-accent-500 border border-accent-500/20',
    warning: 'bg-warning-500/10 text-warning-500 border border-warning-500/20',
    danger: 'bg-danger-500/10 text-danger-500 border border-danger-500/20',
    primary: 'bg-primary-500/10 text-primary-500 border border-primary-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
