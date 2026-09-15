import { ReactNode, FC } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const baseStyles = 'bg-surface-800/50 border border-surface-700/50 rounded-xl overflow-hidden';
  const hoverStyles = hover
    ? 'transition-all duration-200 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer'
    : '';

  const paddings = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};
