import { cn } from '@giulio-leone/lib-design-system';

export interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-row items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step} className="flex flex-1 flex-row items-center">
              <div className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500'
                      : isCurrent
                        ? 'border-primary-600 bg-white dark:border-primary-500 dark:bg-neutral-900'
                        : 'border-neutral-300 bg-transparent dark:border-neutral-700'
                  )}
                >
                  {isCompleted ? (
                    <span className="text-xs font-bold text-white">✓</span>
                  ) : (
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isCurrent
                          ? 'text-primary-600 dark:text-primary-500'
                          : 'text-neutral-400 dark:text-neutral-600'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium tracking-wider uppercase',
                    isCurrent || isCompleted
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-neutral-400 dark:text-neutral-600'
                  )}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="h-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className={cn(
                      'h-full bg-primary-600 transition-all duration-500 dark:bg-primary-500',
                      index < currentStep ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
