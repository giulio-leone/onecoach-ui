'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-shared';
import type { BuilderTempo } from './builder-types';

interface TempoInputProps {
  value?: BuilderTempo | null;
  onChange: (tempo: BuilderTempo | null) => void;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_TEMPO: BuilderTempo = { eccentric: 2, pause1: 0, concentric: 1, pause2: 0 };
const PHASES = ['eccentric', 'pause1', 'concentric', 'pause2'] as const;

export function TempoInput({ value, onChange, disabled, className }: TempoInputProps) {
  const t = useTranslations('workouts.builder.tempo');
  const tempo = value ?? null;
  const isActive = tempo !== null;

  const handleToggle = () => {
    onChange(isActive ? null : DEFAULT_TEMPO);
  };

  const handlePhaseChange = (phase: keyof BuilderTempo, val: string) => {
    if (!tempo) return;
    const num = val === '' ? 0 : Math.min(10, Math.max(0, parseInt(val, 10) || 0));
    onChange({ ...tempo, [phase]: num });
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-all',
          isActive
            ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30'
            : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 dark:bg-white/[0.03] dark:text-neutral-500',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {isActive ? t('active') : t('addTempo')}
      </button>

      {isActive && tempo && (
        <div className="flex items-center gap-0.5">
          {PHASES.map((phase, i) => (
            <div key={phase} className="flex items-center">
              {i > 0 && <span className="px-0.5 text-xs text-neutral-400">-</span>}
              <input
                type="number"
                min={0}
                max={10}
                value={tempo[phase]}
                onChange={(e) => handlePhaseChange(phase, e.target.value)}
                disabled={disabled}
                title={t(phase)}
                className={cn(
                  'h-7 w-8 rounded border text-center text-xs font-mono focus:ring-1 focus:outline-none',
                  'border-violet-200/60 bg-violet-50/50 text-violet-800 focus:border-violet-400 focus:ring-violet-300/50',
                  'dark:border-violet-500/20 dark:bg-violet-500/5 dark:text-violet-300',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              />
            </div>
          ))}
          <span className="ml-1.5 text-[9px] text-neutral-400 dark:text-neutral-500">
            {t('legend')}
          </span>
        </div>
      )}
    </div>
  );
}
