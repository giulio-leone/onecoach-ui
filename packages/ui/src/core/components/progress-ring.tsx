'use client';

import { cn } from '@giulio-leone/lib-design-system';

export interface ProgressRingProps {
  percentage: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string; // Tailwind color like 'green-600'
  backgroundColor?: string; // Tailwind color for track
  showPercentage?: boolean;
}

export function ProgressRing({
  percentage,
  size = 40,
  strokeWidth = 4,
  className,
  color = 'indigo-500',
  backgroundColor = 'neutral-200',
  showPercentage = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`stroke-${backgroundColor} dark:stroke-neutral-700`}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(`stroke-${color}`, 'transition-all duration-500')}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-sm font-bold', `text-${color}`)}>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
