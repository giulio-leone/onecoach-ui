'use client';

import { Avatar } from './avatar';
import { GlassCard } from './glass-card';
import { cn } from '@onecoach/lib-design-system';

interface WelcomeHeaderProps {
  userName?: string | null;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function WelcomeHeader({ userName, className, title, subtitle }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <GlassCard
      intensity="light"
      className={cn(
        'flex items-center gap-6 p-8',
        'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
        'border-white/20 dark:border-white/10',
        className
      )}
    >
      <Avatar
        fallback={userName?.[0] || 'U'}
        size="xl"
        className="h-20 w-20 border-4 border-white shadow-xl dark:border-neutral-800"
        bordered
      />
      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
          {subtitle || `${getGreeting()},`}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title || userName || 'Atleta'}
        </h1>
      </div>
    </GlassCard>
  );
}
