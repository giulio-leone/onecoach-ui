import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Card } from './card';
import { Button } from './button';
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
  style?: any;
}

export function WizardLayout({
  steps,
  currentStepIndex,
  onStepChange,
  onComplete,
  isCompleting = false,
  title,
  subtitle,
  style,
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
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        {title && (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
        {subtitle && (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressArea}>
          <View style={styles.progressContainer}>
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <View key={step.id} style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressBar,
                      isCompleted
                        ? styles.progressBarCompleted
                        : isActive
                          ? styles.progressBarActive
                          : styles.progressBarInactive
                    ]}
                  />
                  {isActive && (
                    <Text style={styles.stepLabel}>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentHeader}>
            <Text style={styles.currentStepTitle}>
              {currentStep.title}
            </Text>
            {currentStep.description && (
              <Text style={styles.currentStepDescription}>
                {currentStep.description}
              </Text>
            )}
          </View>

          <View style={styles.componentContainer}>{currentStep.component}</View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <Card
        variant="glass"
        style={styles.footer}
      >
        <TouchableOpacity
          onPress={handleBack}
          disabled={isFirstStep}
          style={[
            styles.backButton,
            isFirstStep && { opacity: 0 }
          ]}
        >
          <ChevronLeft size={20} color={isFirstStep ? '#cbd5e1' : '#475569'} />
          <Text style={styles.backButtonText}>Indietro</Text>
        </TouchableOpacity>

        <Button
          variant="gradient-primary"
          onPress={handleNext}
          disabled={!currentStep.isValid || isCompleting}
          loading={isCompleting}
          style={styles.nextButton}
        >
          <View style={styles.nextButtonContent}>
            <Text style={styles.nextButtonText}>{isLastStep ? 'Genera' : 'Avanti'}</Text>
            {!isLastStep && <ChevronRight size={20} color="white" />}
            {isLastStep && <Check size={20} color="white" />}
          </View>
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a', // text-neutral-900
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 16,
    color: '#64748b', // text-neutral-500
  },
  progressArea: {
    marginTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
  },
  progressBarCompleted: {
    backgroundColor: '#2563eb', // bg-blue-600
  },
  progressBarActive: {
    backgroundColor: '#bfdbfe', // bg-blue-200
  },
  progressBarInactive: {
    backgroundColor: '#e2e8f0', // bg-neutral-200
  },
  stepLabel: {
    position: 'absolute',
    top: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb', // text-blue-600
  },
  content: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentHeader: {
    marginBottom: 16,
  },
  currentStepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a', // text-neutral-900
    marginBottom: 2,
  },
  currentStepDescription: {
    fontSize: 14,
    color: '#64748b', // text-neutral-500
    lineHeight: 20,
  },
  componentContainer: {
    minHeight: 200,
  },
  scrollContent: {
    paddingBottom: 100, // Reduced from 120
    paddingHorizontal: 4, // Added small horizontal padding for safety
  },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    borderColor: '#e2e8f0', // border-neutral-200
    padding: 16,
    // Shadow for iOS and Web
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
    // Elevation for Android
    elevation: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9', // bg-neutral-100
  },
  backButtonText: {
    fontWeight: '600',
    color: '#475569', // text-neutral-600
  },
  nextButton: {
    minWidth: 140,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontWeight: '700',
    color: 'white',
  },
});
