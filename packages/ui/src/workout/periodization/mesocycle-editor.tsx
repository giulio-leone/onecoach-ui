'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Layers,
  Calendar,
  Target,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, Badge, Button } from '@giulio-leone/ui';

import { PhaseTimeline } from './phase-timeline';
import type { MesocycleConfig, PhaseConfig } from './phase-timeline';

// --- Local types ---

export type PeriodizationModel = 'linear' | 'undulating' | 'block' | 'autoregulated';
export type TrainingGoal = 'strength' | 'hypertrophy' | 'power' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface PresetConfig {
  id: string;
  name: string;
  description?: string;
  config: Partial<MesocycleConfig> & {
    model?: PeriodizationModel;
    goal?: TrainingGoal;
    experienceLevel?: ExperienceLevel;
  };
}

export interface MesocycleEditorConfig {
  model: PeriodizationModel;
  totalWeeks: number;
  goal: TrainingGoal;
  experienceLevel: ExperienceLevel;
  autoDeloadEnabled: boolean;
  deloadFrequency: number;
}

export interface MesocycleEditorProps {
  onGenerate: (config: MesocycleEditorConfig) => void;
  presets?: PresetConfig[];
  initialConfig?: Partial<MesocycleEditorConfig>;
  className?: string;
}

// --- Model descriptions ---

const MODEL_OPTIONS: {
  value: PeriodizationModel;
  icon: React.ElementType;
  descriptionKey: string;
}[] = [
  { value: 'linear', icon: ChevronRight, descriptionKey: 'linearDescription' },
  { value: 'undulating', icon: RotateCcw, descriptionKey: 'undulatingDescription' },
  { value: 'block', icon: Layers, descriptionKey: 'blockDescription' },
  { value: 'autoregulated', icon: Zap, descriptionKey: 'autoregulatedDescription' },
];

const GOAL_OPTIONS: { value: TrainingGoal; icon: React.ElementType }[] = [
  { value: 'strength', icon: Zap },
  { value: 'hypertrophy', icon: Layers },
  { value: 'power', icon: Sparkles },
  { value: 'general', icon: Target },
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced', 'elite'];

// --- Default phase generation for preview ---

function generatePreviewPhases(config: MesocycleEditorConfig): PhaseConfig[] {
  const phases: PhaseConfig[] = [];
  let remainingWeeks = config.totalWeeks;

  if (config.model === 'linear') {
    const accWeeks = Math.max(1, Math.floor(remainingWeeks * 0.5));
    const intWeeks = Math.max(1, Math.floor(remainingWeeks * 0.3));
    const realWeeks = Math.max(1, remainingWeeks - accWeeks - intWeeks - (config.autoDeloadEnabled ? 1 : 0));
    const deloadWeeks = config.autoDeloadEnabled ? Math.max(1, remainingWeeks - accWeeks - intWeeks - realWeeks) : 0;

    phases.push(
      { phase: 'accumulation', durationWeeks: accWeeks, volumeMultiplier: 1.0, intensityMultiplier: 0.7, rpeRange: [6, 8] },
      { phase: 'intensification', durationWeeks: intWeeks, volumeMultiplier: 0.8, intensityMultiplier: 0.85, rpeRange: [7, 9] },
      { phase: 'realization', durationWeeks: realWeeks, volumeMultiplier: 0.6, intensityMultiplier: 1.0, rpeRange: [8, 10] }
    );
    if (deloadWeeks > 0) {
      phases.push({ phase: 'deload', durationWeeks: deloadWeeks, volumeMultiplier: 0.5, intensityMultiplier: 0.6, rpeRange: [4, 6] });
    }
  } else if (config.model === 'block') {
    const blockWeeks = Math.max(1, Math.floor(remainingWeeks / 3));
    const lastBlock = remainingWeeks - blockWeeks * 2 - (config.autoDeloadEnabled ? 1 : 0);

    phases.push(
      { phase: 'accumulation', durationWeeks: blockWeeks, volumeMultiplier: 1.0, intensityMultiplier: 0.7, rpeRange: [6, 8] },
      { phase: 'intensification', durationWeeks: blockWeeks, volumeMultiplier: 0.8, intensityMultiplier: 0.85, rpeRange: [7, 9] },
      { phase: 'realization', durationWeeks: Math.max(1, lastBlock), volumeMultiplier: 0.6, intensityMultiplier: 1.0, rpeRange: [8, 10] }
    );
    if (config.autoDeloadEnabled) {
      phases.push({ phase: 'deload', durationWeeks: 1, volumeMultiplier: 0.5, intensityMultiplier: 0.6, rpeRange: [4, 6] });
    }
  } else {
    // undulating / autoregulated — simplified preview
    const mainWeeks = config.autoDeloadEnabled ? remainingWeeks - 1 : remainingWeeks;
    phases.push({
      phase: 'accumulation',
      durationWeeks: mainWeeks,
      volumeMultiplier: 0.9,
      intensityMultiplier: 0.8,
      rpeRange: [6, 9],
      focusDescription: config.model === 'autoregulated' ? 'RPE-driven auto-adjustment' : 'Daily/weekly variation',
    });
    if (config.autoDeloadEnabled) {
      phases.push({ phase: 'deload', durationWeeks: 1, volumeMultiplier: 0.5, intensityMultiplier: 0.6, rpeRange: [4, 6] });
    }
  }

  return phases;
}

// --- Component ---

export function MesocycleEditor({
  onGenerate,
  presets = [],
  initialConfig,
  className,
}: MesocycleEditorProps) {
  const t = useTranslations();

  const [model, setModel] = useState<PeriodizationModel>(initialConfig?.model ?? 'linear');
  const [totalWeeks, setTotalWeeks] = useState(initialConfig?.totalWeeks ?? 8);
  const [goal, setGoal] = useState<TrainingGoal>(initialConfig?.goal ?? 'hypertrophy');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialConfig?.experienceLevel ?? 'intermediate'
  );
  const [autoDeload, setAutoDeload] = useState(initialConfig?.autoDeloadEnabled ?? true);
  const [deloadFrequency, setDeloadFrequency] = useState(initialConfig?.deloadFrequency ?? 4);

  const editorConfig: MesocycleEditorConfig = useMemo(
    () => ({
      model,
      totalWeeks,
      goal,
      experienceLevel,
      autoDeloadEnabled: autoDeload,
      deloadFrequency,
    }),
    [model, totalWeeks, goal, experienceLevel, autoDeload, deloadFrequency]
  );

  const previewMesocycle: MesocycleConfig = useMemo(
    () => ({
      id: 'preview',
      name: 'Preview',
      model,
      phases: generatePreviewPhases(editorConfig),
      totalWeeks,
      deloadFrequency,
      autoDeloadEnabled: autoDeload,
      goal,
    }),
    [editorConfig, model, totalWeeks, deloadFrequency, autoDeload, goal]
  );

  const handleApplyPreset = useCallback(
    (preset: PresetConfig) => {
      if (preset.config.model) setModel(preset.config.model);
      if (preset.config.goal) setGoal(preset.config.goal);
      if (preset.config.experienceLevel) setExperienceLevel(preset.config.experienceLevel);
      if (preset.config.totalWeeks) setTotalWeeks(preset.config.totalWeeks);
      if (preset.config.autoDeloadEnabled != null) setAutoDeload(preset.config.autoDeloadEnabled);
      if (preset.config.deloadFrequency) setDeloadFrequency(preset.config.deloadFrequency);
    },
    []
  );

  const handleGenerate = useCallback(() => {
    onGenerate(editorConfig);
  }, [onGenerate, editorConfig]);

  // Translation helper with fallback
  const tf = (key: string, fallback: string) =>
    t(`workout.periodization.${key}`, { fallback } as any);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Periodization Model */}
      <Card variant="glass" className="p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <Layers className="h-4 w-4" />
          {tf('model', 'Periodization Model')}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODEL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = model === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setModel(opt.value)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/30 dark:bg-indigo-500/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-white/[0.08] dark:bg-neutral-900 dark:hover:border-neutral-700'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold capitalize',
                      isSelected
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-neutral-900 dark:text-white'
                    )}
                  >
                    {opt.value}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {tf(opt.descriptionKey, opt.descriptionKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Duration & Settings */}
      <Card variant="glass" className="p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          <Calendar className="h-4 w-4" />
          {tf('settings', 'Settings')}
        </h3>

        <div className="space-y-5">
          {/* Total weeks */}
          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>{tf('totalWeeks', 'Total Weeks')}</span>
              <Badge variant="neutral" size="sm">
                {totalWeeks}
              </Badge>
            </label>
            <input
              type="range"
              min={2}
              max={16}
              value={totalWeeks}
              onChange={(e) => setTotalWeeks(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
              <span>2</span>
              <span>16</span>
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tf('goal', 'Goal')}
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = goal === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGoal(opt.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all',
                      isSelected
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {tf('experienceLevel', 'Experience Level')}
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_OPTIONS.map((level) => {
                const isSelected = experienceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperienceLevel(level)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all',
                      isSelected
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600'
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-deload */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {tf('autoDeload', 'Auto-Deload')}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {tf('autoDeloadDescription', 'Automatically insert deload weeks')}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDeload}
              onClick={() => setAutoDeload(!autoDeload)}
              className={cn(
                'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
                autoDeload ? 'bg-indigo-500' : 'bg-neutral-300 dark:bg-neutral-700'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  autoDeload && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {/* Deload frequency (visible only when auto-deload is on) */}
          {autoDeload && (
            <div className="ml-11 pl-3">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {tf('deloadFrequency', 'Deload every')}
                <Info className="h-3.5 w-3.5 text-neutral-400" />
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={deloadFrequency}
                  onChange={(e) =>
                    setDeloadFrequency(Math.min(8, Math.max(2, Number(e.target.value))))
                  }
                  className="w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {tf('weeks', 'weeks')}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Presets */}
      {presets.length > 0 && (
        <Card variant="glass" className="p-4 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            <Sparkles className="h-4 w-4" />
            {tf('presets', 'Presets')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-indigo-500/50"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                {preset.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Phase Preview */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          {tf('preview', 'Preview')}
        </h3>
        <PhaseTimeline mesocycle={previewMesocycle} />
      </div>

      {/* Generate button */}
      <div className="flex justify-end">
        <Button onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {tf('generate', 'Generate Mesocycle')}
        </Button>
      </div>
    </div>
  );
}
