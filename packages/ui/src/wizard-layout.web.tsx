'use client';

import { useState } from 'react';
import { Button } from './button';
import { Card } from './card';
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
}

export function WizardLayout({
  steps,
  currentStepIndex,
  onStepChange,
  onComplete,
  isCompleting = false,
  title,
  subtitle,
}: WizardLayoutProps) {
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col p-4">
      {title && (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => onStepChange(i)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
              i === currentStepIndex
                ? 'bg-primary text-primary-foreground'
                : i < currentStepIndex
                  ? 'bg-primary/20 text-primary'
                  : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700'
            }`}
          >
            {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card className="flex-1 p-6">
        <h2 className="mb-1 text-lg font-semibold">{currentStep?.title}</h2>
        {currentStep?.description && (
          <p className="mb-4 text-sm text-neutral-500">{currentStep.description}</p>
        )}
        <div className="mt-4">{currentStep?.component}</div>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => onStepChange(currentStepIndex - 1)}
          disabled={isFirstStep}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={onComplete}
            disabled={isCompleting || currentStep?.isValid === false}
          >
            {isCompleting ? 'Completing...' : 'Complete'}
            <Check className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => onStepChange(currentStepIndex + 1)}
            disabled={currentStep?.isValid === false}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
