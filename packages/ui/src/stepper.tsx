import { View, Text } from 'react-native';
import { cn } from '@onecoach/lib-design-system';

export interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <View className={cn('w-full', className)}>
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View key={step} className="flex-1 flex-row items-center">
              <View className="flex-1 flex-col items-center gap-2">
                <View
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
                      : isCurrent
                        ? 'border-blue-600 bg-white dark:border-blue-500 dark:bg-neutral-900'
                        : 'border-neutral-300 bg-transparent dark:border-neutral-700'
                  )}
                >
                  {isCompleted ? (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  ) : (
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-500'
                          : 'text-neutral-400 dark:text-neutral-600'
                      )}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  className={cn(
                    'text-[10px] font-medium tracking-wider uppercase',
                    isCurrent || isCompleted
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-neutral-400 dark:text-neutral-600'
                  )}
                >
                  {step}
                </Text>
              </View>

              {index < steps.length - 1 && (
                <View className="h-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800">
                  <View
                    className={cn(
                      'h-full bg-blue-600 transition-all duration-500 dark:bg-blue-500',
                      index < currentStep ? 'w-full' : 'w-0'
                    )}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
