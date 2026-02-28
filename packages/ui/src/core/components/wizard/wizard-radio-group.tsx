import { cn } from '@giulio-leone/lib-design-system';

interface WizardRadioGroupProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}

export function WizardRadioGroup<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: WizardRadioGroupProps<T>) {
  return (
    <div className={cn('flex flex-row gap-2', className)}>
      {options.map((option: any) => {
        const isSelected = value === option.id;
        return (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 items-center justify-center rounded-xl border-2 px-4 py-3 transition-all outline-none focus:ring-2 focus:ring-primary-500/20',
              isSelected
                ? 'border-primary-500 bg-primary-50 font-semibold text-primary-700 dark:border-primary-500/50 dark:bg-primary-600/20 dark:text-primary-100'
                : 'border-neutral-200/60 bg-white font-medium text-neutral-600 hover:border-neutral-300 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
