import { cn } from '@giulio-leone/lib-design-system';

interface WizardSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  description?: string;
  step?: number;
  className?: string; // Added className to props interface
}

export function WizardSlider({
  label,
  value,
  min,
  max,
  onChange,
  valueLabel,
  minLabel,
  maxLabel,
  description,
  step = 1,
  className,
}: WizardSliderProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-white/[0.08] dark:bg-neutral-900/50',
        className
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <label className="text-sm font-medium text-neutral-900 dark:text-white">{label}</label>
        <div className="rounded-lg bg-primary-100 px-3 py-1 dark:bg-primary-900/30">
          <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
            {value} {valueLabel}
          </span>
        </div>
      </div>

      <div className="relative flex h-6 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary-600 dark:bg-white/[0.08] dark:accent-primary-500"
        />
      </div>

      <div className="flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <span>{minLabel || min}</span>
        <span>{maxLabel || max}</span>
      </div>

      {description && (
        <p className="mt-1 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-500 dark:border-white/[0.08] dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
