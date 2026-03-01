'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-shared';
import type { BuilderSetType } from './builder-types';

interface SetTypeSelectorProps {
  value: BuilderSetType;
  onChange: (type: BuilderSetType) => void;
  disabled?: boolean;
}

const SET_TYPE_CONFIG: Record<BuilderSetType, { icon: string; colorClass: string }> = {
  straight: { icon: '⬜', colorClass: 'bg-neutral-100 text-neutral-700 dark:bg-white/[0.06] dark:text-neutral-300' },
  drop_set: { icon: '⬇️', colorClass: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  rest_pause: { icon: '⏸️', colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  amrap: { icon: '🔥', colorClass: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  timed: { icon: '⏱️', colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  warmup: { icon: '🔄', colorClass: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
};

const SET_TYPES: BuilderSetType[] = ['straight', 'drop_set', 'rest_pause', 'amrap', 'timed', 'warmup'];

export function SetTypeSelector({ value, onChange, disabled }: SetTypeSelectorProps) {
  const t = useTranslations('workouts.builder.setTypes');

  return (
    <div className="flex flex-wrap gap-1">
      {SET_TYPES.map((type) => {
        const config = SET_TYPE_CONFIG[type];
        const isActive = value === type;
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition-all',
              isActive
                ? cn(config.colorClass, 'ring-2 ring-indigo-400/50')
                : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 dark:bg-white/[0.03] dark:text-neutral-500 dark:hover:bg-white/[0.06]',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span className="text-xs">{config.icon}</span>
            {t(type)}
          </button>
        );
      })}
    </div>
  );
}
