import { cn } from '@onecoach/lib-design-system';
import { useTranslations } from 'next-intl';
import type { HTMLAttributes } from 'react';

/**
 * Loader Component - AI Elements v6
 *
 * Animated loading spinner with multiple variants for different use cases.
 *
 * @see https://v6.ai-sdk.dev/elements/components/loader
 */

type LoaderIconProps = {
  size?: number;
};

const LoaderIcon = ({ size = 16 }: LoaderIconProps) => {
  const t = useTranslations('common');
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      style={{ color: 'currentcolor' }}
      viewBox="0 0 16 16"
      width={size}
    >
      <title>{t('loading')}</title>
      <g clipPath="url(#clip0_2393_1490)">
        <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 16V12" opacity="0.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3.29773 1.52783L5.64887 4.7639"
          opacity="0.9"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12.7023 1.52783L10.3511 4.7639"
          opacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12.7023 14.472L10.3511 11.236"
          opacity="0.4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3.29773 14.472L5.64887 11.236"
          opacity="0.6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M15.6085 5.52783L11.8043 6.7639"
          opacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M0.391602 10.472L4.19583 9.23598"
          opacity="0.7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M15.6085 10.4722L11.8043 9.2361"
          opacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M0.391602 5.52783L4.19583 6.7639"
          opacity="0.8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
      <defs>
        <clipPath id="clip0_2393_1490">
          <rect fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
};

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
  variant?: 'default' | 'primary' | 'subtle';
};

export const Loader = ({ className, size = 16, variant = 'default', ...props }: LoaderProps) => (
  <div
    className={cn(
      'inline-flex animate-spin items-center justify-center',
      variant === 'primary' && 'text-primary-500',
      variant === 'subtle' && 'text-neutral-400 dark:text-neutral-500',
      className
    )}
    {...props}
  >
    <LoaderIcon size={size} />
  </div>
);

/**
 * DotsLoader - Animated typing dots indicator
 */
export type DotsLoaderProps = HTMLAttributes<HTMLDivElement>;

export const DotsLoader = ({ className, ...props }: DotsLoaderProps) => (
  <div
    className={cn('flex items-center gap-1', className)}
    aria-label={useTranslations('common')('loading')}
    {...props}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn(
          'bg-primary-500 size-1.5 rounded-full',
          'animate-bounce',
          i === 0 && '[animation-delay:0ms]',
          i === 1 && '[animation-delay:150ms]',
          i === 2 && '[animation-delay:300ms]'
        )}
      />
    ))}
  </div>
);

/**
 * PulseLoader - Pulsing circle loader
 */
export type PulseLoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg';
};

export const PulseLoader = ({ className, size = 'md', ...props }: PulseLoaderProps) => {
  const sizeClasses = {
    sm: 'size-2',
    md: 'size-3',
    lg: 'size-4',
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      aria-label={useTranslations('common')('loading')}
      {...props}
    >
      <span
        className={cn('bg-primary-500/50 absolute animate-ping rounded-full', sizeClasses[size])}
      />
      <span className={cn('bg-primary-500 rounded-full', sizeClasses[size])} />
    </div>
  );
};
