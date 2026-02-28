'use client';

import { useState, useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Gauge,
  Trophy,
  Zap,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PhaseAnalytics {
  name: string;
  type: 'hypertrophy' | 'strength' | 'power' | 'deload' | 'peaking';
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming';
  metrics: {
    avgVolume: number;
    avgIntensity: number;
    avgRPE: number | null;
    workoutsPlanned: number;
    workoutsCompleted: number;
    prsAchieved: number;
  };
}

export interface PeriodizationAnalyticsProps {
  phases: PhaseAnalytics[];
  currentPhaseIndex?: number;
  mesocycleProgress?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PHASE_COLORS: Record<PhaseAnalytics['type'], { bg: string; text: string; bar: string }> = {
  hypertrophy: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
    bar: 'bg-violet-500',
  },
  strength: {
    bg: 'bg-primary-50 dark:bg-primary-500/10',
    text: 'text-primary-700 dark:text-primary-300',
    bar: 'bg-primary-500',
  },
  power: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  deload: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-400',
  },
  peaking: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    bar: 'bg-rose-500',
  },
};

const PHASE_LABELS: Record<PhaseAnalytics['type'], string> = {
  hypertrophy: 'Ipertrofia',
  strength: 'Forza',
  power: 'Potenza',
  deload: 'Scarico',
  peaking: 'Picco',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

function completionRate(planned: number, completed: number): number {
  if (planned === 0) return 0;
  return Math.round((completed / planned) * 100);
}

// ── Mesocycle progress ─────────────────────────────────────────────────────

function MesocycleProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">
          Progresso mesociclo
        </span>
        <span className="font-bold text-neutral-900 dark:text-white">{clamped}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

// ── Phase timeline (Gantt-like) ────────────────────────────────────────────

function PhaseTimeline({
  phases,
  selectedIndex,
  onSelect,
}: {
  phases: PhaseAnalytics[];
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const totalDays = useMemo(() => {
    if (phases.length === 0) return 1;
    const first = phases[0]!;
    const last = phases[phases.length - 1]!;
    const start = new Date(first.startDate).getTime();
    const end = new Date(last.endDate).getTime();
    return Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
  }, [phases]);

  const globalStart = phases.length > 0 ? new Date(phases[0]!.startDate).getTime() : 0;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        Timeline fasi
      </p>
      <div className="relative flex h-10 gap-0.5 overflow-hidden rounded-xl bg-neutral-100 dark:bg-white/[0.04]">
        {phases.map((phase, i) => {
          const start = new Date(phase.startDate).getTime();
          const end = new Date(phase.endDate).getTime();
          const days = (end - start) / (1000 * 60 * 60 * 24);
          const widthPct = (days / totalDays) * 100;
          const leftPct = ((start - globalStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;
          const colors = PHASE_COLORS[phase.type];

          return (
            <button
              key={`${phase.name}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              title={`${phase.name} (${PHASE_LABELS[phase.type]})`}
              className={cn(
                'absolute top-0 h-full transition-opacity hover:opacity-90',
                colors.bar,
                phase.status === 'active' && 'ring-2 ring-white dark:ring-neutral-900',
                phase.status === 'upcoming' && 'opacity-50',
                selectedIndex === i && 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900'
              )}
              style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
            >
              {widthPct > 12 && (
                <span className="absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-semibold text-white">
                  {PHASE_LABELS[phase.type]}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {(Object.keys(PHASE_COLORS) as PhaseAnalytics['type'][]).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-sm', PHASE_COLORS[type].bar)} />
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
              {PHASE_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase detail card ──────────────────────────────────────────────────────

function PhaseDetailCard({ phase }: { phase: PhaseAnalytics }) {
  const colors = PHASE_COLORS[phase.type];
  const rate = completionRate(phase.metrics.workoutsPlanned, phase.metrics.workoutsCompleted);

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        'border-neutral-200 bg-white/80 dark:border-white/[0.08] dark:bg-neutral-900/80'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase', colors.bg, colors.text)}>
            {PHASE_LABELS[phase.type]}
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {phase.name}
          </span>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            phase.status === 'completed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
            phase.status === 'active' && 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400',
            phase.status === 'upcoming' && 'bg-neutral-100 text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400'
          )}
        >
          {phase.status === 'completed' ? 'Completata' : phase.status === 'active' ? 'Attiva' : 'In arrivo'}
        </span>
      </div>

      {/* Date */}
      <p className="mb-3 flex items-center gap-1 text-xs text-neutral-400">
        <Clock className="h-3 w-3" />
        {formatDate(phase.startDate)} — {formatDate(phase.endDate)}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={Activity} label="Volume medio" value={phase.metrics.avgVolume.toLocaleString('it-IT')} />
        <Stat icon={Zap} label="Intensità media" value={`${phase.metrics.avgIntensity}%`} />
        <Stat icon={Gauge} label="RPE medio" value={phase.metrics.avgRPE?.toFixed(1) ?? '—'} />
        <Stat icon={Dumbbell} label="Completamento" value={`${rate}%`} subtext={`${phase.metrics.workoutsCompleted}/${phase.metrics.workoutsPlanned}`} />
        <Stat icon={Trophy} label="PR raggiunti" value={String(phase.metrics.prsAchieved)} />
        {phase.type === 'deload' && phase.metrics.avgRPE !== null && (
          <Stat icon={CheckCircle2} label="RPE scarico" value={phase.metrics.avgRPE.toFixed(1)} subtext={phase.metrics.avgRPE <= 6 ? 'Efficace' : 'Alto'} />
        )}
      </div>

      {/* Completion bar */}
      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.04]">
          <div
            className={cn('h-full rounded-full transition-all', colors.bar)}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
      <div className="min-w-0">
        <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-sm font-bold text-neutral-900 dark:text-white">{value}</p>
        {subtext && <p className="text-[10px] text-neutral-400">{subtext}</p>}
      </div>
    </div>
  );
}

// ── Volume / intensity overlay ─────────────────────────────────────────────

function VolumeIntensityOverlay({ phases }: { phases: PhaseAnalytics[] }) {
  const maxVol = Math.max(...phases.map((p) => p.metrics.avgVolume), 1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        Volume e intensità per fase
      </p>
      <div className="flex items-end gap-1" style={{ height: 120 }}>
        {phases.map((phase, i) => {
          const volH = (phase.metrics.avgVolume / maxVol) * 100;
          const intH = phase.metrics.avgIntensity;
          const colors = PHASE_COLORS[phase.type];

          return (
            <div key={`${phase.name}-${i}`} className="group relative flex flex-1 items-end justify-center gap-0.5" style={{ height: '100%' }}>
              {/* Volume bar */}
              <div
                className={cn('w-3 rounded-t transition-all', colors.bar, 'opacity-70')}
                style={{ height: `${volH}%` }}
                title={`Volume: ${phase.metrics.avgVolume}`}
              />
              {/* Intensity bar */}
              <div
                className="w-3 rounded-t bg-neutral-400 transition-all dark:bg-neutral-500"
                style={{ height: `${intH}%` }}
                title={`Intensità: ${phase.metrics.avgIntensity}%`}
              />
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-neutral-900">
                {PHASE_LABELS[phase.type]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-violet-500" /> Volume
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-neutral-400 dark:bg-neutral-500" /> Intensità
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function PeriodizationAnalytics({
  phases,
  currentPhaseIndex,
  mesocycleProgress,
}: PeriodizationAnalyticsProps) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(
    currentPhaseIndex ?? null
  );

  const selected = selectedPhase !== null ? phases[selectedPhase] : null;

  return (
    <div className="space-y-6">
      {/* Mesocycle progress */}
      {mesocycleProgress !== undefined && (
        <MesocycleProgressBar progress={mesocycleProgress} />
      )}

      {/* Phase timeline */}
      <PhaseTimeline
        phases={phases}
        selectedIndex={selectedPhase}
        onSelect={setSelectedPhase}
      />

      {/* Selected phase detail */}
      {selected ? (
        <PhaseDetailCard phase={selected} />
      ) : (
        <p className="text-center text-xs text-neutral-400">
          Seleziona una fase nella timeline per vedere i dettagli
        </p>
      )}

      {/* Volume / intensity overlay */}
      {phases.length > 0 && <VolumeIntensityOverlay phases={phases} />}

      {/* Phase list (compact) */}
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Tutte le fasi
        </p>
        {phases.map((phase, i) => {
          const colors = PHASE_COLORS[phase.type];
          const rate = completionRate(phase.metrics.workoutsPlanned, phase.metrics.workoutsCompleted);
          return (
            <button
              key={`${phase.name}-${i}`}
              type="button"
              onClick={() => setSelectedPhase(i)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                selectedPhase === i
                  ? 'border-primary-200 bg-primary-50/50 dark:border-primary-500/30 dark:bg-primary-500/5'
                  : 'border-neutral-100 bg-white/60 hover:bg-neutral-50 dark:border-white/[0.08] dark:bg-neutral-900/40 dark:hover:bg-white/[0.06]/60'
              )}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.bar)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-neutral-900 dark:text-white">
                  {phase.name}
                </span>
                <span className="block text-[10px] text-neutral-400">
                  {formatDate(phase.startDate)} — {formatDate(phase.endDate)} · {rate}% completato
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
