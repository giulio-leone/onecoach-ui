'use client';

import { Heading, Label, SelectionCard, Text, Textarea } from '@giulio-leone/ui';
import {
  Sparkles,
  Calendar,
  Briefcase,
  BookOpen,
  Coffee,
  Target,
  Clock,
  Layout,
  Zap,
} from 'lucide-react';
import { cn, darkModeClasses } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';

// Standard Mesh Wizard
import {
  MeshWizard,
  type MeshWizardStep,
  type MeshWizardStepProps,
} from '@giulio-leone/ui/agent';
import { useOneAgendaGeneration } from '@giulio-leone/hooks';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type OneAgendaFormData = {
  description: string;
  focusType: 'general' | 'work' | 'study' | 'routine';
  planningHorizon: 'day' | 'week' | 'month';
  intensity: 'relaxed' | 'balanced' | 'intense';
};

const INITIAL_FORM_DATA: OneAgendaFormData = {
  description: '',
  focusType: 'general',
  planningHorizon: 'week',
  intensity: 'balanced',
};

interface OneAgendaGeneratorProps {
  variant?: 'page' | 'dialog';
  onComplete?: () => void;
}

// ----------------------------------------------------------------------------
// Steps
// ----------------------------------------------------------------------------

// Step 1: Intent & Description
const StepOne = ({ formData, setFormData }: MeshWizardStepProps<OneAgendaFormData>) => {
  const t = useTranslations('oneagenda.generator');

  const options = [
    {
      id: 'general',
      label: t('focus.general.label'),
      icon: Layout,
      desc: t('focus.general.desc'),
    },
    {
      id: 'work',
      label: t('focus.work.label'),
      icon: Briefcase,
      desc: t('focus.work.desc'),
    },
    {
      id: 'study',
      label: t('focus.study.label'),
      icon: BookOpen,
      desc: t('focus.study.desc'),
    },
    {
      id: 'routine',
      label: t('focus.routine.label'),
      icon: Clock,
      desc: t('focus.routine.desc'),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Heading level={3} className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('focus.question')}
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {options.map((option) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              description={option.desc}
              selected={formData.focusType === option.id}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  focusType: option.id as OneAgendaFormData['focusType'],
                }))
              }
              icon={<option.icon className="h-5 w-5" />}
              contentClassName="p-4"
              className="h-full transition-all hover:scale-[1.02]"
              compact={true}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            {t('description.label')}
          </Label>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('description.helper')}
          </Text>
        </div>
        <div className="relative">
          <Textarea
            rows={5}
            placeholder={t('description.placeholder')}
            className={cn(
              'w-full resize-none rounded-xl border-2 px-4 py-3 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-primary-500 focus:ring-primary-200 dark:focus:border-primary-400 dark:focus:ring-primary-900/50'
            )}
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Sparkles className="absolute right-3 bottom-3 h-4 w-4 text-primary-500/50" />
        </div>
      </div>
    </div>
  );
};

// Step 2: Horizon & Intensity
const StepTwo = ({ formData, setFormData }: MeshWizardStepProps<OneAgendaFormData>) => {
  const t = useTranslations('oneagenda.generator');

  const horizonOptions = [
    { id: 'day', label: t('horizon.day'), icon: Clock },
    { id: 'week', label: t('horizon.week'), icon: Calendar },
    { id: 'month', label: t('horizon.month'), icon: Target },
  ];

  const intensityOptions = [
    {
      id: 'relaxed',
      label: t('intensity.relaxed.label'),
      icon: Coffee,
      desc: t('intensity.relaxed.desc'),
    },
    {
      id: 'balanced',
      label: t('intensity.balanced.label'),
      icon: Layout,
      desc: t('intensity.balanced.desc'),
    },
    {
      id: 'intense',
      label: t('intensity.intense.label'),
      icon: Zap,
      desc: t('intensity.intense.desc'),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Heading level={3} className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('horizon.title')}
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {horizonOptions.map((option) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              selected={formData.planningHorizon === option.id}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  planningHorizon: option.id as OneAgendaFormData['planningHorizon'],
                }))
              }
              icon={<option.icon className="h-5 w-5" />}
              contentClassName="p-4 justify-center text-center"
              className="h-full transition-all hover:scale-[1.02]"
              compact={true}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Heading level={3} className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('intensity.title')}
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {intensityOptions.map((option) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              description={option.desc}
              selected={formData.intensity === option.id}
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  intensity: option.id as OneAgendaFormData['intensity'],
                }))
              }
              icon={<option.icon className="h-5 w-5" />}
              contentClassName="p-4"
              className="h-full transition-all hover:scale-[1.02]"
              compact={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function OneAgendaGenerator({ variant = 'page', onComplete }: OneAgendaGeneratorProps) {
  const t = useTranslations('oneagenda.generator');

  // Use custom hook for generation logic
  const { isGenerating, progress, currentMessage, logs, result, error, generate, reset } =
    useOneAgendaGeneration();

  const steps: MeshWizardStep<OneAgendaFormData>[] = [
    { title: t('steps.objectives'), component: StepOne, validate: (d) => !!d.description.trim() },
    { title: t('steps.preferences'), component: StepTwo },
  ];

  const handleGenerate = async (data: OneAgendaFormData) => {
    const enrichedDescription = `
      Contesto: ${data.focusType.toUpperCase()}
      Orizzonte: ${data.planningHorizon.toUpperCase()}
      Intensità: ${data.intensity.toUpperCase()}
      Richiesta: ${data.description}
    `.trim();

    await generate({
      description: enrichedDescription,
      userPreferences: {
        focusPreference: data.intensity === 'intense' ? 'MORNING' : 'ANY',
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <MeshWizard
        title={t('common.oneagenda_generator.ai_agenda')}
        steps={steps}
        initialData={INITIAL_FORM_DATA}
        onGenerate={handleGenerate}
        // Generation State
        status={error ? 'error' : result ? 'success' : isGenerating ? 'generating' : 'idle'}
        progress={progress}
        currentMessage={currentMessage}
        logs={logs as unknown as GenerationLogEvent[]}
        result={result}
        error={error}
        onReset={reset}
        // Success View Config
        successConfig={{
          title: t('success.title'),
          message: t('success.message'),
          stats: (res) => {
            const result = res as {
              goals?: unknown[];
              tasks?: unknown[];
              qaReport?: { overallScore?: number };
            };
            return [
              { label: t('success.stats.goals'), value: String(result?.goals?.length || 0) },
              { label: t('success.stats.tasks'), value: String(result?.tasks?.length || 0) },
              {
                label: t('success.stats.score'),
                value: `${result?.qaReport?.overallScore || 'N/A'}/100`,
              },
            ];
          },
          actionLabel: t('success.action'),
          onAction: () => {
            onComplete?.();
            window.location.href = '/oneagenda';
          },
        }}
        variant={variant}
        nextLabel={t('actions.next')}
        generateLabel={t('actions.generate')}
      />
    </div>
  );
}
