'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Ruler,
  Dumbbell,
  Apple,
  Bot,
  X,
  Sparkles,
  Activity,
  Target,
  Flame,
  Zap,
  Heart,
  Weight,
  Clock,
  Cable,
  AlertTriangle,
  Salad,
  Egg,
  Leaf,
  Beef,
  UtensilsCrossed,
  Settings,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'custom';
export type AiMode = 'full_auto' | 'suggestions' | 'manual_only';

export interface OnboardingProfile {
  // Step 1: Basic Info
  displayName: string;
  fitnessLevel: FitnessLevel;
  primaryGoal: PrimaryGoal;
  // Step 2: Body Metrics
  weight?: number;
  height?: number;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  bodyFatPercent?: number;
  // Step 3: Training Preferences
  daysPerWeek: number;
  preferredDuration: number;
  equipment: Equipment[];
  injuriesOrLimitations?: string;
  // Step 4: Nutrition Preferences
  dietType: DietType;
  mealsPerDay: number;
  allergies: string[];
  calorieTarget?: number;
  // Step 5: AI Preference
  aiMode: AiMode;
}

export interface OnboardingWizardProps {
  onComplete: (profile: OnboardingProfile) => void;
  onSkip?: () => void;
  initialStep?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { title: 'Basic Info', icon: User },
  { title: 'Body Metrics', icon: Ruler },
  { title: 'Training', icon: Dumbbell },
  { title: 'Nutrition', icon: Apple },
  { title: 'AI Mode', icon: Bot },
] as const;

const FITNESS_LEVELS: { id: FitnessLevel; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'beginner', label: 'Beginner', description: 'New to training or returning after a long break', icon: Heart },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years of consistent training', icon: Activity },
  { id: 'advanced', label: 'Advanced', description: '3+ years, familiar with periodization', icon: Zap },
];

const GOALS: { id: PrimaryGoal; label: string; icon: React.ElementType }[] = [
  { id: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
  { id: 'fat_loss', label: 'Fat Loss', icon: Flame },
  { id: 'strength', label: 'Strength', icon: Weight },
  { id: 'endurance', label: 'Endurance', icon: Activity },
  { id: 'general_fitness', label: 'General Fitness', icon: Target },
];

const EQUIPMENT_OPTIONS: { id: Equipment; label: string; icon: React.ElementType }[] = [
  { id: 'barbell', label: 'Barbell', icon: Dumbbell },
  { id: 'dumbbell', label: 'Dumbbell', icon: Dumbbell },
  { id: 'machine', label: 'Machine', icon: Settings },
  { id: 'bodyweight', label: 'Bodyweight', icon: User },
  { id: 'cable', label: 'Cable', icon: Cable },
  { id: 'kettlebell', label: 'Kettlebell', icon: Weight },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
];

const DIET_OPTIONS: { id: DietType; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'standard', label: 'Standard', description: 'No dietary restrictions', icon: UtensilsCrossed },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat, includes dairy & eggs', icon: Salad },
  { id: 'vegan', label: 'Vegan', description: 'Plant-based only', icon: Leaf },
  { id: 'keto', label: 'Keto', description: 'High fat, very low carb', icon: Egg },
  { id: 'paleo', label: 'Paleo', description: 'Whole foods, no processed', icon: Beef },
  { id: 'custom', label: 'Custom', description: 'Define your own approach', icon: Settings },
];

const AI_MODES: { id: AiMode; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'full_auto', label: 'Full Auto', description: 'AI generates and manages your entire plan — workouts, nutrition, and periodization', icon: Sparkles },
  { id: 'suggestions', label: 'Suggestions', description: 'AI proposes options and you pick what works best for you', icon: Bot },
  { id: 'manual_only', label: 'Manual', description: 'You build everything yourself, AI only answers questions', icon: User },
];

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function RadioCard({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 outline-none',
        selected
          ? 'border-primary-500 bg-primary-50/80 dark:border-primary-400 dark:bg-primary-950/30'
          : 'border-neutral-200/60 bg-white hover:border-neutral-300 dark:border-white/[0.08] dark:bg-zinc-950 dark:hover:border-white/[0.15]',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors',
          selected
            ? 'bg-primary-500 text-white'
            : 'bg-neutral-100 text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm font-semibold',
            selected ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-800 dark:text-neutral-200'
          )}
        >
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </span>
        )}
      </div>
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          selected
            ? 'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400'
            : 'border-neutral-300 dark:border-white/[0.1]'
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children}
      {optional && (
        <span className="ml-1 text-xs font-normal text-neutral-400 dark:text-neutral-500">
          (optional)
        </span>
      )}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all',
        'placeholder:text-neutral-400',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
        'dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-100 dark:placeholder:text-neutral-500',
        'dark:focus:border-primary-400 dark:focus:ring-primary-400/30',
        className
      )}
      {...props}
    />
  );
}

function AllergyTagInput({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const tag = input.trim().toLowerCase();
      if (!tags.includes(tag)) onAdd(tag);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-300 bg-white p-2 dark:border-white/[0.1] dark:bg-white/[0.04]">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type and press Enter…' : ''}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepBasicInfo({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Display Name</FieldLabel>
        <TextInput
          value={profile.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="How should we call you?"
          autoFocus
        />
      </div>

      <div>
        <FieldLabel>Fitness Level</FieldLabel>
        <div className="space-y-2">
          {FITNESS_LEVELS.map((lvl) => (
            <RadioCard
              key={lvl.id}
              selected={profile.fitnessLevel === lvl.id}
              onClick={() => onChange({ fitnessLevel: lvl.id })}
              icon={lvl.icon}
              label={lvl.label}
              description={lvl.description}
            />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Primary Goal</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange({ primaryGoal: g.id })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                'focus-visible:ring-2 focus-visible:ring-primary-500 outline-none',
                profile.primaryGoal === g.id
                  ? 'border-primary-500 bg-primary-50/80 dark:border-primary-400 dark:bg-primary-950/30'
                  : 'border-neutral-200/60 bg-white hover:border-neutral-300 dark:border-white/[0.08] dark:bg-zinc-950 dark:hover:border-white/[0.15]'
              )}
            >
              <g.icon
                className={cn(
                  'h-5 w-5',
                  profile.primaryGoal === g.id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
              />
              <span
                className={cn(
                  'text-xs font-semibold',
                  profile.primaryGoal === g.id
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBodyMetrics({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  const [useImperial, setUseImperial] = useState(false);

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Units:</span>
        <button
          type="button"
          onClick={() => setUseImperial(false)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            !useImperial
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400'
          )}
        >
          Metric
        </button>
        <button
          type="button"
          onClick={() => setUseImperial(true)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            useImperial
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400'
          )}
        >
          Imperial
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Weight ({useImperial ? 'lbs' : 'kg'})</FieldLabel>
          <TextInput
            type="number"
            value={profile.weight ?? ''}
            onChange={(e) => onChange({ weight: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={useImperial ? '165' : '75'}
            min={0}
          />
        </div>
        <div>
          <FieldLabel optional>Height ({useImperial ? 'ft/in' : 'cm'})</FieldLabel>
          <TextInput
            type="number"
            value={profile.height ?? ''}
            onChange={(e) => onChange({ height: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={useImperial ? '70' : '178'}
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel optional>Age</FieldLabel>
          <TextInput
            type="number"
            value={profile.age ?? ''}
            onChange={(e) => onChange({ age: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="28"
            min={13}
            max={120}
          />
        </div>
        <div>
          <FieldLabel optional>Sex</FieldLabel>
          <select
            value={profile.sex ?? ''}
            onChange={(e) =>
              onChange({ sex: (e.target.value || undefined) as OnboardingProfile['sex'] })
            }
            className={cn(
              'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
              'dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-100'
            )}
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <FieldLabel optional>
          Body Fat % {profile.bodyFatPercent != null && <span className="text-primary-600 dark:text-primary-400">{profile.bodyFatPercent}%</span>}
        </FieldLabel>
        <input
          type="range"
          min={3}
          max={50}
          step={1}
          value={profile.bodyFatPercent ?? 20}
          onChange={(e) => onChange({ bodyFatPercent: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-600 dark:bg-white/[0.08]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
          <span>3%</span>
          <span>50%</span>
        </div>
      </div>
    </div>
  );
}

function StepTraining({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  const toggleEquipment = (eq: Equipment) => {
    const current = profile.equipment;
    const next = current.includes(eq) ? current.filter((e) => e !== eq) : [...current, eq];
    onChange({ equipment: next });
  };

  return (
    <div className="space-y-6">
      {/* Days per week */}
      <div>
        <FieldLabel>
          Days per Week{' '}
          <span className="text-primary-600 dark:text-primary-400">{profile.daysPerWeek}</span>
        </FieldLabel>
        <input
          type="range"
          min={1}
          max={7}
          step={1}
          value={profile.daysPerWeek}
          onChange={(e) => onChange({ daysPerWeek: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-600 dark:bg-white/[0.08]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <span key={d} className={cn(d === profile.daysPerWeek && 'font-bold text-primary-600 dark:text-primary-400')}>
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Session duration */}
      <div>
        <FieldLabel>Session Duration</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preferredDuration: opt.value })}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                'focus-visible:ring-2 focus-visible:ring-primary-500 outline-none',
                profile.preferredDuration === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/30 dark:text-primary-300'
                  : 'border-neutral-200/60 text-neutral-600 hover:border-neutral-300 dark:border-white/[0.08] dark:text-neutral-400 dark:hover:border-white/[0.15]'
              )}
            >
              <Clock className="mr-1.5 inline h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <FieldLabel>Available Equipment</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const selected = profile.equipment.includes(eq.id);
            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => toggleEquipment(eq.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all',
                  'focus-visible:ring-2 focus-visible:ring-primary-500 outline-none',
                  selected
                    ? 'border-primary-500 bg-primary-50/80 dark:border-primary-400 dark:bg-primary-950/30'
                    : 'border-neutral-200/60 bg-white hover:border-neutral-300 dark:border-white/[0.08] dark:bg-zinc-950 dark:hover:border-white/[0.15]'
                )}
              >
                <eq.icon
                  className={cn(
                    'h-4 w-4',
                    selected ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'
                  )}
                />
                <span className={cn('text-xs font-semibold', selected ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-300')}>
                  {eq.label}
                </span>
                {selected && <Check className="ml-auto h-4 w-4 text-primary-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Injuries */}
      <div>
        <FieldLabel optional>Injuries or Limitations</FieldLabel>
        <textarea
          value={profile.injuriesOrLimitations ?? ''}
          onChange={(e) => onChange({ injuriesOrLimitations: e.target.value || undefined })}
          placeholder="e.g. Lower back pain, shoulder impingement…"
          rows={3}
          className={cn(
            'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 transition-all',
            'placeholder:text-neutral-400',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
            'dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-100 dark:placeholder:text-neutral-500'
          )}
        />
      </div>
    </div>
  );
}

function StepNutrition({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Diet type */}
      <div>
        <FieldLabel>Diet Type</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DIET_OPTIONS.map((d) => (
            <RadioCard
              key={d.id}
              selected={profile.dietType === d.id}
              onClick={() => onChange({ dietType: d.id })}
              icon={d.icon}
              label={d.label}
              description={d.description}
            />
          ))}
        </div>
      </div>

      {/* Meals per day */}
      <div>
        <FieldLabel>
          Meals per Day{' '}
          <span className="text-primary-600 dark:text-primary-400">{profile.mealsPerDay}</span>
        </FieldLabel>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ mealsPerDay: n })}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-bold transition-all',
                'focus-visible:ring-2 focus-visible:ring-primary-500 outline-none',
                profile.mealsPerDay === n
                  ? 'border-primary-500 bg-primary-600 text-white'
                  : 'border-neutral-200/60 text-neutral-600 hover:border-neutral-300 dark:border-white/[0.08] dark:text-neutral-400'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <FieldLabel optional>Allergies / Intolerances</FieldLabel>
        <AllergyTagInput
          tags={profile.allergies}
          onAdd={(tag) => onChange({ allergies: [...profile.allergies, tag] })}
          onRemove={(tag) => onChange({ allergies: profile.allergies.filter((t) => t !== tag) })}
        />
      </div>

      {/* Calorie target */}
      <div>
        <FieldLabel optional>Daily Calorie Target (kcal)</FieldLabel>
        <TextInput
          type="number"
          value={profile.calorieTarget ?? ''}
          onChange={(e) =>
            onChange({ calorieTarget: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="e.g. 2200"
          min={800}
          max={10000}
        />
      </div>
    </div>
  );
}

function StepAiMode({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Choose how much the AI coach should be involved in planning your workouts and nutrition.
      </p>
      <div className="space-y-3">
        {AI_MODES.map((m) => (
          <RadioCard
            key={m.id}
            selected={profile.aiMode === m.id}
            onClick={() => onChange({ aiMode: m.id })}
            icon={m.icon}
            label={m.label}
            description={m.description}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary screen
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-2 last:border-0 dark:border-white/[0.06]">
      <span className="shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-right text-sm font-semibold text-neutral-800 dark:text-neutral-200">{value}</span>
    </div>
  );
}

function Summary({ profile }: { profile: OnboardingProfile }) {
  const goalLabel = GOALS.find((g) => g.id === profile.primaryGoal)?.label ?? profile.primaryGoal;
  const dietLabel = DIET_OPTIONS.find((d) => d.id === profile.dietType)?.label ?? profile.dietType;
  const aiLabel = AI_MODES.find((m) => m.id === profile.aiMode)?.label ?? profile.aiMode;
  const fitnessLabel = FITNESS_LEVELS.find((f) => f.id === profile.fitnessLevel)?.label ?? profile.fitnessLevel;

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Review your selections before finishing setup.
      </p>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">Basic Info</h4>
        <SummaryRow label="Name" value={profile.displayName} />
        <SummaryRow label="Level" value={fitnessLabel} />
        <SummaryRow label="Goal" value={goalLabel} />
      </div>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">Body Metrics</h4>
        <SummaryRow label="Weight" value={profile.weight != null ? `${profile.weight}` : undefined} />
        <SummaryRow label="Height" value={profile.height != null ? `${profile.height}` : undefined} />
        <SummaryRow label="Age" value={profile.age} />
        <SummaryRow label="Sex" value={profile.sex} />
        <SummaryRow label="Body Fat" value={profile.bodyFatPercent != null ? `${profile.bodyFatPercent}%` : undefined} />
      </div>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">Training</h4>
        <SummaryRow label="Days/week" value={profile.daysPerWeek} />
        <SummaryRow label="Duration" value={`${profile.preferredDuration} min`} />
        <SummaryRow label="Equipment" value={profile.equipment.join(', ')} />
        <SummaryRow label="Limitations" value={profile.injuriesOrLimitations} />
      </div>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">Nutrition</h4>
        <SummaryRow label="Diet" value={dietLabel} />
        <SummaryRow label="Meals/day" value={profile.mealsPerDay} />
        <SummaryRow label="Allergies" value={profile.allergies.length > 0 ? profile.allergies.join(', ') : undefined} />
        <SummaryRow label="Calories" value={profile.calorieTarget != null ? `${profile.calorieTarget} kcal` : undefined} />
      </div>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <h4 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">AI Mode</h4>
        <SummaryRow label="Mode" value={aiLabel} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}: {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = completedSteps.has(idx);
          const isClickable = isCompleted && idx !== currentStep;
          const Icon = step.icon;

          return (
            <li key={step.title} className="relative flex flex-1 flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(idx)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isActive
                    ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : isCompleted
                      ? 'cursor-pointer border-primary-400/50 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-400'
                      : 'border-neutral-200/60 text-neutral-400 dark:border-white/[0.08] dark:text-neutral-500'
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </button>
              <span
                className={cn(
                  'hidden text-[10px] font-semibold tracking-wider uppercase sm:block',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : isCompleted
                      ? 'text-neutral-600 dark:text-neutral-400'
                      : 'text-neutral-400 dark:text-neutral-600'
                )}
              >
                {step.title}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 right-[calc(-50%+20px)] left-[calc(50%+20px)] h-[2px] transition-all',
                    isCompleted
                      ? 'bg-primary-400/60'
                      : 'bg-neutral-200 dark:bg-white/[0.08]'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

const TOTAL_STEPS = STEPS.length;
const SUMMARY_STEP = TOTAL_STEPS; // virtual step index for summary

const DEFAULT_PROFILE: OnboardingProfile = {
  displayName: '',
  fitnessLevel: 'beginner',
  primaryGoal: 'general_fitness',
  daysPerWeek: 4,
  preferredDuration: 60,
  equipment: ['bodyweight'],
  dietType: 'standard',
  mealsPerDay: 3,
  allergies: [],
  aiMode: 'suggestions',
};

export function OnboardingWizard({ onComplete, onSkip, initialStep = 0 }: OnboardingWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [profile, setProfile] = useState<OnboardingProfile>({ ...DEFAULT_PROFILE });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isSummary = step === SUMMARY_STEP;

  const patchProfile = useCallback((patch: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return profile.displayName.trim().length > 0;
      case 1:
        return true; // all optional
      case 2:
        return profile.equipment.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  }, [step, profile]);

  const handleNext = () => {
    if (!canProceed) return;
    setCompletedSteps((prev) => new Set([...prev, step]));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleStepClick = (idx: number) => {
    if (completedSteps.has(idx)) setStep(idx);
  };

  const handleConfirm = () => {
    onComplete(profile);
  };

  // Render current step content
  const stepContent = (() => {
    switch (step) {
      case 0:
        return <StepBasicInfo profile={profile} onChange={patchProfile} />;
      case 1:
        return <StepBodyMetrics profile={profile} onChange={patchProfile} />;
      case 2:
        return <StepTraining profile={profile} onChange={patchProfile} />;
      case 3:
        return <StepNutrition profile={profile} onChange={patchProfile} />;
      case 4:
        return <StepAiMode profile={profile} onChange={patchProfile} />;
      case SUMMARY_STEP:
        return <Summary profile={profile} />;
      default:
        return null;
    }
  })();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      {/* Progress bar */}
      <ProgressBar
        currentStep={Math.min(step, TOTAL_STEPS - 1)}
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Step title */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {isSummary ? 'Review & Confirm' : STEPS[step].title}
        </h2>
        {!isSummary && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
        )}
      </div>

      {/* Step content */}
      <div className="min-h-0 flex-1">{stepContent}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-all',
            'hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]',
            'focus-visible:ring-2 focus-visible:ring-primary-500 outline-none',
            step === 0 && 'pointer-events-none opacity-0'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Skip link */}
          {onSkip && !isSummary && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              Skip for now
            </button>
          )}

          {isSummary ? (
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all',
                'bg-primary-600 hover:bg-primary-500 active:scale-95',
                'shadow-lg shadow-primary-600/30',
                'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 outline-none'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Complete Setup
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all',
                'bg-primary-600 hover:bg-primary-500 active:scale-95',
                'shadow-lg shadow-primary-600/30',
                'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 outline-none',
                !canProceed && 'pointer-events-none opacity-40 shadow-none'
              )}
            >
              {step === TOTAL_STEPS - 1 ? 'Review' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
