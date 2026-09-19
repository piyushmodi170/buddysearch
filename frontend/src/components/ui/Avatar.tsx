import React from 'react';
import { cn, getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', isOnline, className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const indicatorSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <div className={cn("relative inline-block", sizes[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold border border-primary-light">
          {name ? getInitials(name) : '?'}
        </div>
      )}
      {isOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-white",
            indicatorSizes[size]
          )}
        />
      )}
    </div>
  );
}
