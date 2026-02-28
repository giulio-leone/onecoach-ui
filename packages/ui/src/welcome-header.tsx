'use client';

import { Avatar } from './avatar';
import { Card } from './card';
import { cn } from '@giulio-leone/lib-design-system';

interface WelcomeHeaderProps {
  userName?: string | null;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function WelcomeHeader({ userName, className, title, subtitle }: WelcomeHeaderProps) {
  return (
    <Card
      variant="glass"
      glassIntensity="light"
      className={cn(
        'flex items-center gap-6 p-8',
        'bg-gradient-to-r from-indigo-500/10 to-secondary-500/10',
        'border-white/20 dark:border-white/10',
        className
      )}
    >
      <Avatar
        fallback={userName?.[0] || 'U'}
        size="xl"
        className="h-20 w-20 border-4 border-white shadow-xl dark:border-white/[0.06]"
        bordered
      />
      <div className="flex flex-col gap-1">
        {subtitle && (
          <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </span>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title || userName || 'Welcome'}
        </h1>
      </div>
    </Card>
  );
}
