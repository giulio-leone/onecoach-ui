import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bordered?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-xl',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  bordered = false,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        bordered &&
          'ring-2 ring-indigo-500 ring-offset-2 dark:ring-indigo-400 dark:ring-offset-[#09090b]',
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || fallback}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 font-medium text-neutral-600 uppercase dark:bg-white/[0.04] dark:text-neutral-300">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
