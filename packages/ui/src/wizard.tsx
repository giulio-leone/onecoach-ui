import React from 'react';
import { cn } from '@onecoach/lib-design-system';
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

export const WizardStepper = ({ steps, currentStep, onStepClick, className }: WizardStepperProps) => {
  return (
    <nav aria-label="Progress" className={cn("w-full px-2", className)}>
      <ol role="list" className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <li key={step.title} className="relative flex-1 group">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => isCompleted && onStepClick?.(index)}
                  disabled={index > currentStep}
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-xl border-2 transition-all duration-500",
                    "h-8 w-8 sm:h-10 sm:w-10",
                    isActive 
                      ? "border-transparent bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110" 
                      : isCompleted 
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                        : "border-neutral-200/50 bg-white/40 text-neutral-400 dark:border-neutral-800/50 dark:bg-neutral-900/40 backdrop-blur-md"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-black tracking-tighter">{index + 1}</span>
                  )}
                </button>

                <div className="hidden sm:flex flex-col items-center text-center px-1">
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500", 
                    isActive ? "text-blue-600 dark:text-blue-400" : 
                    isCompleted ? "text-neutral-900 dark:text-neutral-200 opacity-80" :
                    "text-neutral-400 dark:text-neutral-500 opacity-40"
                  )}>
                    {step.title}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-4 sm:top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-[1px] -z-0 transition-all duration-700",
                      isCompleted ? "bg-gradient-to-r from-blue-600/60 to-blue-400/40" : "bg-neutral-200 dark:bg-neutral-800/50"
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
    <div className={cn(
      "flex-1 flex flex-col relative overflow-hidden transition-all duration-700",
      "rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)]",
      "dark:border-white/10 dark:bg-white/5 dark:shadow-[0_60px_150px_rgba(0,0,0,0.4)]",
      "ring-1 ring-inset ring-white/30 dark:ring-white/5",
      className
    )}>
      {/* Ambient background glows - Refined & Minimalist */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px] -z-10 animate-blob" />
      
      {/* Mesh Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none -z-10" />

      {header && (
        <div className="border-b border-white/20 dark:border-white/5 px-4 sm:px-6 py-4 sm:py-6 bg-white/20 dark:bg-white/5">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-10 py-5 sm:py-6">
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-between border-t border-white/20 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-xl p-4 sm:px-8 lg:px-10">
          {footer}
        </div>
      )}
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
  generateLabel?: string;
  className?: string;
}

export const WizardActions = ({ 
  onBack, 
  onNext, 
  canBack, 
  canNext, 
  isLastStep,
  nextLabel = "Continua",
  generateLabel = "Genera Piano",
  className 
}: WizardActionsProps) => {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canBack}
        className={cn(
          "h-12 px-6 gap-2 rounded-2xl text-neutral-600 dark:text-neutral-400 font-bold transition-all hover:bg-white/50 dark:hover:bg-white/5",
          !canBack && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
        Indietro
      </Button>

      <Button 
        onClick={onNext}
        disabled={!canNext}
        className={cn(
          "h-12 min-w-[160px] gap-2 font-black rounded-2xl shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] transition-all",
          "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white border-0",
          !canNext && "opacity-40 grayscale pointer-events-none shadow-none"
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
  onChange: (value: any) => void;
  className?: string;
}

export const WizardRadioGroup = ({ options, value, onChange, className }: WizardRadioGroupProps) => {
  return (
    <div className={cn(
      "relative flex p-1.5 gap-1.5 items-center rounded-2xl overflow-hidden",
      "bg-white/30 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10",
      "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]",
      className
    )}>
      {options.map((option) => {
        const isSelected = option.id === value;
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex-1 z-10 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300",
              isSelected 
                ? "text-blue-700 dark:text-blue-50" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="active-pill"
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl",
                  "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600/40 dark:to-blue-500/30",
                  "shadow-[0_4px_12px_rgba(59,130,246,0.3)] dark:shadow-[0_8px_20px_rgba(37,99,235,0.4)]",
                  "border border-blue-400/50 dark:border-blue-400/30",
                  "before:absolute before:inset-0 before:bg-white/20 before:rounded-xl before:opacity-0 hover:before:opacity-100 transition-opacity"
                )}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
