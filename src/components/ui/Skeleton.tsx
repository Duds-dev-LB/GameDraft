import { FC } from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton: FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const baseStyles = 'bg-surface-700 animate-pulse';
  
  const variants = {
    text: 'rounded h-4 w-full',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};
