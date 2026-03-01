import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './button';

/**
 * WizardStepper - Horizontal progress indicator
 */
export interface WizardStepperProps {
  steps: { title: string }[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const WizardStepper = ({
  steps,
  currentStep,
  onStepClick,
  className,
}: WizardStepperProps) => {
  return (
    <nav aria-label="Progress" className={cn('w-full px-6 py-4', className)}>
      <ol role="list" className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li key={step.title} className="group relative flex-1">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => isCompleted && onStepClick?.(index)}
                  disabled={index > currentStep}
                  className={cn(
                    'relative z-10 flex items-center justify-center rounded-xl border-2 transition-all duration-500',
                    'h-8 w-8 sm:h-10 sm:w-10',
                    isActive
                      ? 'scale-110 border-transparent bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]'
                      : isCompleted
                        ? 'border-primary-500/40 bg-primary-500/10 text-primary-500 shadow-[0_0_15px_rgba(79,70,229,0.1)] dark:bg-primary-500/20'
                        : 'border-neutral-200/50 bg-white/40 text-neutral-400 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-xs font-black tracking-tighter sm:text-sm">
                      {index + 1}
                    </span>
                  )}
                </button>

                <div className="hidden flex-col items-center px-1 text-center sm:flex">
                  <span
                    className={cn(
                      'text-[9px] font-bold tracking-[0.15em] uppercase transition-all duration-500 sm:text-[10px]',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : isCompleted
                          ? 'text-neutral-900 opacity-80 dark:text-neutral-200'
                          : 'text-neutral-400 opacity-40 dark:text-neutral-500'
                    )}
                  >
                    {step.title}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-4 right-[calc(-50%+24px)] left-[calc(50%+24px)] -z-0 h-[1px] transition-all duration-700 sm:top-5',
                      isCompleted
                        ? 'bg-gradient-to-r from-primary-600/60 to-primary-400/40'
                        : 'bg-neutral-200 dark:bg-white/[0.05]'
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * WizardContainer - Main glassmorphism layout for wizard content
 */
export interface WizardContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const WizardContainer = ({ children, header, footer, className }: WizardContainerProps) => {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
      {header && <div className="flex-shrink-0 px-6 py-4 sm:px-8 sm:py-6">{header}</div>}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8">
        {children}
        {footer && (
          <div className="pb-safe mt-8 flex flex-shrink-0 items-center justify-between py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * WizardActions - Navigation buttons
 */
export interface WizardActionsProps {
  onBack: () => void;
  onNext: () => void;
  canBack: boolean;
  canNext: boolean;
  isLastStep: boolean;
  nextLabel?: string;
  backLabel?: string;
  generateLabel?: string;
  className?: string;
}

export const WizardActions = ({
  onBack,
  onNext,
  canBack,
  canNext,
  isLastStep,
  nextLabel = 'Continue',
  backLabel = 'Back',
  generateLabel = 'Generate Plan',
  className,
}: WizardActionsProps) => {
  return (
    <div className={cn('flex w-full items-center justify-between', className)}>
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canBack}
        className={cn(
          'h-12 gap-2 rounded-2xl px-6 font-bold text-neutral-600 transition-all hover:bg-white/50 dark:text-neutral-400 dark:hover:bg-white/5',
          !canBack && 'pointer-events-none opacity-0'
        )}
      >
        <ChevronLeft className="h-5 w-5" />
        {backLabel}
      </Button>

      <Button
        onClick={onNext}
        disabled={!canNext}
        className={cn(
          'h-12 min-w-[160px] gap-2 rounded-2xl font-black shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] transition-all',
          'border-0 bg-primary-600 text-white hover:bg-primary-500 active:scale-95',
          !canNext && 'pointer-events-none opacity-40 shadow-none grayscale'
        )}
      >
        {isLastStep ? (
          <>
            {generateLabel}
            <Sparkles className="h-5 w-5 fill-current" />
          </>
        ) : (
          <>
            {nextLabel}
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
};

/**
 * WizardRadioGroup - Premium Segmented Control for wizard choices
 */
export interface WizardRadioOption {
  id: string | number;
  label: string;
}

export interface WizardRadioGroupProps {
  options: WizardRadioOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}

export const WizardRadioGroup = ({
  options,
  value,
  onChange,
  className,
}: WizardRadioGroupProps) => {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 overflow-hidden rounded-2xl p-1.5',
        'border border-white/40 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]',
        'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      {options.map((option: any) => {
        const isSelected = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'relative z-10 flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300',
              isSelected
                ? 'text-primary-700 dark:text-primary-50'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="active-pill"
                className={cn(
                  'absolute inset-0 -z-10 rounded-xl',
                  'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600/40 dark:to-primary-500/30',
                  'shadow-[0_4px_12px_rgba(99,102,241,0.3)] dark:shadow-[0_8px_20px_rgba(79,70,229,0.4)]',
                  'border border-primary-400/50 dark:border-primary-400/30',
                  'transition-opacity before:absolute before:inset-0 before:rounded-xl before:bg-white/20 before:opacity-0 hover:before:opacity-100'
                )}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
