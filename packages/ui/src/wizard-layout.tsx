import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { cn } from '@onecoach/lib-design-system';
import { GlassCard } from './glass-card';
import { GradientButton } from './gradient-button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';

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
    <View className={cn('flex-1', className)}>
      {/* Header */}
      <View className="mb-6">
        {title && (
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</Text>
        )}
        {subtitle && (
          <Text className="mt-1 text-base text-neutral-500 dark:text-neutral-400">{subtitle}</Text>
        )}

        {/* Progress Bar */}
        <View className="mt-6">
          <View className="flex-row justify-between px-1">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <View key={step.id} className="flex-1 items-center">
                  <View
                    className={cn(
                      'h-1 w-full rounded-full transition-all duration-300',
                      isCompleted
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : isActive
                          ? 'bg-blue-200 dark:bg-blue-900'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                    )}
                  />
                  {isActive && (
                    <Text className="absolute top-3 text-xs font-bold text-blue-600 dark:text-blue-400">
                      Step {index + 1}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {currentStep.title}
          </Text>
          {currentStep.description && (
            <Text className="mt-1 text-base text-neutral-500 dark:text-neutral-400">
              {currentStep.description}
            </Text>
          )}
        </View>

        <View className="min-h-[300px]">{currentStep.component}</View>
      </ScrollView>

      {/* Footer Actions */}
      <GlassCard
        intensity="heavy"
        className="absolute right-0 bottom-0 left-0 flex-row items-center justify-between rounded-t-3xl rounded-b-none border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-neutral-800"
      >
        <TouchableOpacity
          onPress={handleBack}
          disabled={isFirstStep}
          className={cn(
            'flex-row items-center gap-2 rounded-xl px-4 py-3 transition-all',
            isFirstStep
              ? 'opacity-0'
              : 'bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:active:bg-neutral-700'
          )}
        >
          <ChevronLeft size={20} color={isFirstStep ? '#cbd5e1' : '#475569'} />
          <Text className="font-semibold text-neutral-600 dark:text-neutral-300">Indietro</Text>
        </TouchableOpacity>

        <GradientButton
          onPress={handleNext}
          disabled={!currentStep.isValid || isCompleting}
          loading={isCompleting}
          className="min-w-[140px]"
        >
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-white">{isLastStep ? 'Genera' : 'Avanti'}</Text>
            {!isLastStep && <ChevronRight size={20} color="white" />}
            {isLastStep && <Check size={20} color="white" />}
          </View>
        </GradientButton>
      </GlassCard>
    </View>
  );
}
