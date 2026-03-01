/**
 * LoadingIndicator Component (AI Steps)
 *
 * Refactored for a "Graphic & Modern" look.
 * Hides raw text behind a sleek visual step process.
 */

'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { Sparkles, Brain, Zap, CheckCircle2 } from 'lucide-react';

export interface LoadingIndicatorProps {
  stage?: number;
  /**
   * Messaggio opzionale da mostrare sotto l'animazione
   */
  message?: string;
  /**
   * Dimensione del componente
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Classi aggiuntive per personalizzare il contenitore
   */
  className?: string;
}

const stages = [
  { icon: Sparkles, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
  { icon: Brain, color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  { icon: Zap, color: 'text-primary-400', glow: 'shadow-primary-500/20' },
  { icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
];

const sizeClasses = {
  sm: {
    container: 'max-w-sm p-4',
    iconWrapper: 'h-10 w-10',
    barWidth: 'w-24',
  },
  md: {
    container: 'max-w-md p-6',
    iconWrapper: 'h-12 w-12',
    barWidth: 'w-32',
  },
  lg: {
    container: 'max-w-lg p-8',
    iconWrapper: 'h-14 w-14',
    barWidth: 'w-40',
  },
};

const LoadingIndicatorComponent = ({
  stage = 0,
  message,
  size = 'md',
  className,
}: LoadingIndicatorProps) => {
  if (stages.length === 0) {
    return null;
  }
  const currentStageIndex = ((stage % stages.length) + stages.length) % stages.length;
  const currentStage = stages[currentStageIndex]!;
  const Icon = currentStage.icon;

  if (!currentStage || !Icon) {
    return null;
  }

  const sizeStyle = sizeClasses[size] ?? sizeClasses.md;

  return (
    <div className="animate-fadeIn w-full max-w-md">
      {/* Glass Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 shadow-2xl backdrop-blur-xl',
          sizeStyle.container,
          className
        )}
      >
        {/* Background Ambient Glow based on stage color */}
        <div
          className={cn(
            'absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-colors duration-700',
            currentStage.color.replace('text-', 'bg-')
          )}
        />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Animated Icon */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex items-center justify-center rounded-xl bg-white/5 shadow-inner transition-all duration-500',
                sizeStyle.iconWrapper,
                currentStage.glow
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 animate-pulse transition-all duration-500',
                  currentStage.color
                )}
              />
            </div>

            {/* Text Replacement: Abstract Progress Bars */}
            <div className="flex flex-col gap-1.5">
              <div
                className={cn('h-1.5 overflow-hidden rounded-full bg-white/5', sizeStyle.barWidth)}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    currentStage.color.replace('text-', 'bg-')
                  )}
                  style={{ width: `${((currentStageIndex + 1) / 4) * 100}%` }}
                />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i: number) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 w-6 rounded-full transition-colors duration-300',
                      i <= currentStageIndex ? 'bg-white/20' : 'bg-white/5'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Processing Badge (Instead of text) */}
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/20 px-3 py-1.5 backdrop-blur-md">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
              AI PROCESSING
            </span>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-neutral-400">{message}</p>
        </div>
      ) : null}
    </div>
  );
};

export { LoadingIndicatorComponent as LoadingIndicator };
