import { Card } from './card';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  isValid?: boolean;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onComplete: () => void;
  isCompleting?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function WizardLayout({
  steps,
  currentStepIndex,
  onStepChange,
  onComplete,
  isCompleting = false,
  title,
  subtitle,
  className,
}: WizardLayoutProps) {
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  if (!currentStep) return null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStepIndex - 1);
    }
  };

  return (
    <div className={`flex flex-1 flex-col ${className ?? ''}`}>
      {/* Header */}
      <div className="mb-6">
        {title && <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {subtitle && <p className="mt-1 text-base text-neutral-500 dark:text-neutral-400">{subtitle}</p>}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex flex-row justify-between px-1">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="relative flex flex-1 flex-col items-center">
                  <div
                    className={`h-1 w-full rounded-sm ${
                      isCompleted
                        ? 'bg-primary-600'
                        : isActive
                          ? 'bg-primary-200'
                          : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  />
                  {isActive && (
                    <span className="text-primary-600 absolute top-3 text-xs font-bold">
                      Step {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-1 pb-24">
        <div className="mb-4">
          <h3 className="mb-0.5 text-xl font-bold text-neutral-900 dark:text-white">
            {currentStep.title}
          </h3>
          {currentStep.description && (
            <p className="text-sm leading-5 text-neutral-500 dark:text-neutral-400">
              {currentStep.description}
            </p>
          )}
        </div>

        <div className="min-h-[200px]">{currentStep.component}</div>
      </div>

      {/* Footer Actions */}
      <Card
        variant="glass"
        className="absolute inset-x-0 bottom-0 flex flex-row items-center justify-between rounded-b-none rounded-t-3xl border-t border-neutral-200/60 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-white/10"
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          className={`flex flex-row items-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 font-semibold text-neutral-600 dark:bg-white/5 dark:text-neutral-400 ${isFirstStep ? 'opacity-0' : ''}`}
        >
          <ChevronLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
          Indietro
        </button>

        <Button
          variant="gradient-primary"
          onPress={handleNext}
          disabled={!currentStep.isValid || isCompleting}
          loading={isCompleting}
          className="min-w-[140px]"
        >
          <span className="flex flex-row items-center gap-2 font-bold text-white">
            {isLastStep ? 'Genera' : 'Avanti'}
            {!isLastStep && <ChevronRight size={20} className="text-white" />}
            {isLastStep && <Check size={20} className="text-white" />}
          </span>
        </Button>
      </Card>
    </div>
  );
}

