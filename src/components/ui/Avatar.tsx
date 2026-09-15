import { FC } from 'react';
import { getAvatarColor, getAvatarInitials } from '@/utils/avatar';

export interface AvatarProps {
  name: string;
  seed: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: FC<AvatarProps> = ({ name, seed, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const backgroundColor = getAvatarColor(seed);
  const initials = getAvatarInitials(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium shrink-0 ${sizes[size]}`}
      style={{ backgroundColor }}
      title={name}
    >
      {initials}
    </div>
  );
};
