'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardStepper, WizardContainer, WizardActions } from '@giulio-leone/ui';
import type { GenerationLogEvent } from '@/components/ai-elements/generation-log';
import { MeshGenerationView } from './mesh-generation-view';
import { cn } from '@giulio-leone/lib-design-system';


// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MeshWizardStepProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

export interface MeshWizardStep<T> {
  title: string;
  description?: string;
  component: React.ComponentType<MeshWizardStepProps<T>>;
  validate?: (data: T) => boolean;
}

export interface MeshWizardProps<T> {
  title: string;
  steps: MeshWizardStep<T>[];
  initialData: T;
  onGenerate: (data: T) => Promise<void>;
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  currentMessage: string;
  logs: GenerationLogEvent[];
  result?: unknown;
  error?: string | Error | null;
  onReset: () => void;
  successConfig: {
    title: string;
    message: string | ((result: unknown) => string);
    stats?: (result: unknown) => { label: string; value: string; icon?: React.ElementType }[];
    actionLabel: string;
    onAction: (result: unknown) => void;
  };
  variant?: 'page' | 'dialog';

  className?: string;
  nextLabel?: string;
  backLabel?: string;
  generateLabel?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function MeshWizard<T>({
  title,
  steps,
  initialData,
  onGenerate,
  status,
  progress,
  currentMessage,
  logs,
  result,
  error,
  onReset,
  successConfig,
  variant = 'page',
  className,
  nextLabel,
  backLabel,
  generateLabel,
}: MeshWizardProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialData);

  // Synchronize internal state when initialData changes (e.g., profile data loaded)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onGenerate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    onReset();
    setCurrentStep(0);
    setFormData(initialData);
  };

  // 1. Generation / Result View
  if (status !== 'idle') {
    return (
      <div
        className={cn(
          'animate-in fade-in slide-in-from-bottom-4 h-full min-h-[600px] w-full duration-500',
          className
        )}
      >
        <MeshGenerationView
          status={status}
          progress={progress}
          currentMessage={currentMessage}
          logs={logs}
          result={result}
          error={error instanceof Error ? error.message : error || undefined}
          successTitle={successConfig.title}
          successMessage={
            typeof successConfig.message === 'function'
              ? successConfig.message(result)
              : successConfig.message
          }
          successStats={successConfig.stats ? successConfig.stats(result) : undefined}
          successActionLabel={successConfig.actionLabel}
          onSuccessAction={() => successConfig.onAction(result)}
          onReset={handleReset}
          title={`${title} Orchestrator`}
        />
      </div>
    );
  }

  // 2. Wizard Form View
  const currentStepDef = steps[currentStep];

  if (!currentStepDef) {
    return null;
  }

  const CurrentStepComponent = currentStepDef.component;
  const isValid = currentStepDef.validate ? currentStepDef.validate(formData) : true;
  const isLastStep = currentStep === steps.length - 1;

  // Header content for the container
  const header = (
    <>
      {/* Mobile-only compact header */}
      <div className="flex items-center justify-between sm:hidden">
        <div>
          <p className="mb-0.5 text-[9px] font-bold tracking-[0.15em] text-blue-500 uppercase">
            Step {currentStep + 1}/{steps.length}
          </p>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {currentStepDef.title}
          </h2>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <span className="text-xs font-bold text-blue-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Desktop/Tablet header */}
      <div className="hidden items-end justify-between sm:flex">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl dark:text-white">
            {currentStepDef.title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {currentStepDef.description}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className={cn('relative flex h-full w-full flex-1 flex-col', className)}>
      {/* Ambient Background Glows */}
      {variant === 'page' && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[70%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/10" />
          <div className="absolute -right-[10%] -bottom-[20%] h-[70%] w-[70%] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/10" />
        </div>
      )}

      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => setCurrentStep(index)}
        className="mb-3 sm:mb-4"
      />

      {/* Content abstraction */}
      <WizardContainer
        header={header}
        footer={
          <WizardActions
            onBack={handleBack}
            onNext={handleNext}
            canBack={currentStep > 0}
            canNext={isValid}
            isLastStep={isLastStep}
            nextLabel={nextLabel}
            backLabel={backLabel}
            generateLabel={generateLabel}
          />
        }
        className={
          variant === 'dialog' ? 'backdrop-blur-0 border-0 bg-transparent shadow-none' : ''
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-6xl"
          >
            <CurrentStepComponent formData={formData} setFormData={setFormData} />
          </motion.div>
        </AnimatePresence>
      </WizardContainer>
    </div>
  );
}
