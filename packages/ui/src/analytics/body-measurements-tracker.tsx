'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Ruler,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  bodyFatPercent?: number | null;
  muscleMassPercent?: number | null;
  circumferences?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicepLeft?: number;
    bicepRight?: number;
    thighLeft?: number;
    thighRight?: number;
    calf?: number;
    neck?: number;
    shoulders?: number;
  } | null;
  notes?: string | null;
}

export interface BodyMeasurementInput {
  date: string;
  weight: number;
  bodyFatPercent?: number;
  muscleMassPercent?: number;
  circumferences?: Record<string, number>;
  notes?: string;
}

export interface BodyMeasurementsTrackerProps {
  latestMeasurement?: BodyMeasurement;
  history: BodyMeasurement[];
  onSave: (measurement: BodyMeasurementInput) => void;
  onDelete?: (id: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function diffBadge(current: number, previous: number | undefined, unit: string, invert = false) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  const positive = diff > 0;
  const color = invert
    ? positive
      ? 'text-rose-500'
      : 'text-emerald-500'
    : positive
      ? 'text-emerald-500'
      : 'text-rose-500';

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-semibold', color)}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}
      {diff.toFixed(1)} {unit}
    </span>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-6 w-[60px]', className)} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-500"
      />
    </svg>
  );
}

// ── Circumference labels ───────────────────────────────────────────────────

const CIRCUMFERENCE_FIELDS: { key: string; label: string }[] = [
  { key: 'chest', label: 'Petto' },
  { key: 'waist', label: 'Vita' },
  { key: 'hips', label: 'Fianchi' },
  { key: 'shoulders', label: 'Spalle' },
  { key: 'neck', label: 'Collo' },
  { key: 'bicepLeft', label: 'Bicipite SX' },
  { key: 'bicepRight', label: 'Bicipite DX' },
  { key: 'thighLeft', label: 'Coscia SX' },
  { key: 'thighRight', label: 'Coscia DX' },
  { key: 'calf', label: 'Polpaccio' },
];

// ── Weight input ───────────────────────────────────────────────────────────

function WeightInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const adjust = (delta: number) => {
    onChange(Math.max(0, +(value + delta).toFixed(1)));
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => adjust(-0.1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          min="0"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="h-14 w-28 rounded-xl border border-neutral-200 bg-white text-center text-2xl font-bold text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
          kg
        </span>
      </div>
      <button
        type="button"
        onClick={() => adjust(0.1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Slider input ───────────────────────────────────────────────────────────

function PercentSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 60,
  step = 0.1,
  sparkData,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  sparkData?: number[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
        <div className="flex items-center gap-2">
          {sparkData && sparkData.length >= 2 && <Sparkline data={sparkData} />}
          <span className="min-w-[3rem] text-right text-sm font-bold text-neutral-900 dark:text-white">
            {value !== undefined ? `${value.toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-500 dark:bg-white/[0.08]"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function BodyMeasurementsTracker({
  latestMeasurement,
  history,
  onSave,
  onDelete,
}: BodyMeasurementsTrackerProps) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState(latestMeasurement?.weight ?? 70);
  const [bodyFat, setBodyFat] = useState<number | undefined>(
    latestMeasurement?.bodyFatPercent ?? undefined
  );
  const [muscleMass, setMuscleMass] = useState<number | undefined>(
    latestMeasurement?.muscleMassPercent ?? undefined
  );
  const [circumferences, setCircumferences] = useState<Record<string, number>>(() => {
    const c = latestMeasurement?.circumferences;
    if (!c) return {};
    const out: Record<string, number> = {};
    for (const f of CIRCUMFERENCE_FIELDS) {
      const v = c[f.key as keyof typeof c];
      if (v !== undefined) out[f.key] = v;
    }
    return out;
  });
  const [notes, setNotes] = useState('');
  const [circumOpen, setCircumOpen] = useState(false);

  const last10 = useMemo(() => history.slice(0, 10), [history]);

  const sparkWeights = useMemo(() => last10.map((m) => m.weight).reverse(), [last10]);
  const sparkBf = useMemo(
    () => last10.filter((m) => m.bodyFatPercent != null).map((m) => m.bodyFatPercent!).reverse(),
    [last10],
  );
  const sparkMm = useMemo(
    () => last10.filter((m) => m.muscleMassPercent != null).map((m) => m.muscleMassPercent!).reverse(),
    [last10],
  );

  const handleCircumChange = useCallback((key: string, val: string) => {
    setCircumferences((prev) => {
      const n = parseFloat(val);
      if (isNaN(n) || n <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: n };
    });
  }, []);

  const handleSave = () => {
    const input: BodyMeasurementInput = { date, weight };
    if (bodyFat !== undefined) input.bodyFatPercent = bodyFat;
    if (muscleMass !== undefined) input.muscleMassPercent = muscleMass;
    if (Object.keys(circumferences).length > 0) input.circumferences = circumferences;
    if (notes.trim()) input.notes = notes.trim();
    onSave(input);
  };

  return (
    <div className="space-y-6">
      {/* ── Date picker ── */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-neutral-400" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-primary-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
        />
      </div>

      {/* ── Weight quick entry ── */}
      <div className="rounded-xl border border-neutral-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/[0.06] dark:bg-neutral-900/80">
        <div className="mb-3 flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary-500" />
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Peso corporeo
          </span>
          {sparkWeights.length >= 2 && <Sparkline data={sparkWeights} className="ml-auto" />}
        </div>
        <div className="flex items-center gap-4">
          <WeightInput value={weight} onChange={setWeight} />
          {diffBadge(weight, latestMeasurement?.weight, 'kg', true)}
        </div>
      </div>

      {/* ── Body composition ── */}
      <div className="rounded-xl border border-neutral-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/[0.06] dark:bg-neutral-900/80">
        <p className="mb-4 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Composizione corporea
        </p>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <PercentSlider
                label="Massa grassa"
                value={bodyFat}
                onChange={setBodyFat}
                max={50}
                sparkData={sparkBf}
              />
            </div>
            {bodyFat !== undefined &&
              diffBadge(bodyFat, latestMeasurement?.bodyFatPercent ?? undefined, '% BF', true)}
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <PercentSlider
                label="Massa muscolare"
                value={muscleMass}
                onChange={setMuscleMass}
                max={60}
                sparkData={sparkMm}
              />
            </div>
            {muscleMass !== undefined &&
              diffBadge(muscleMass, latestMeasurement?.muscleMassPercent ?? undefined, '% MM')}
          </div>
        </div>
      </div>

      {/* ── Circumferences ── */}
      <div className="rounded-xl border border-neutral-200/50 bg-white/80 shadow-sm backdrop-blur-sm dark:border-white/[0.06] dark:bg-neutral-900/80">
        <button
          type="button"
          onClick={() => setCircumOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Circonferenze
            </span>
          </div>
          {circumOpen ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </button>
        {circumOpen && (
          <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 px-5 pb-5 pt-3 dark:border-white/[0.08] sm:grid-cols-3">
            {CIRCUMFERENCE_FIELDS.map((f) => {
              const histValues = last10
                .filter((m) => m.circumferences?.[f.key as keyof NonNullable<BodyMeasurement['circumferences']>] != null)
                .map((m) => m.circumferences![f.key as keyof NonNullable<BodyMeasurement['circumferences']>]!)
                .reverse();

              return (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      {f.label}
                    </label>
                    {histValues.length >= 2 && <Sparkline data={histValues} className="h-4 w-10" />}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="—"
                      value={circumferences[f.key] ?? ''}
                      onChange={(e) => handleCircumChange(f.key, e.target.value)}
                      className="h-8 w-full rounded-lg border border-neutral-200 bg-white px-2 pr-7 text-sm text-neutral-900 outline-none focus:border-primary-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                      cm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Note aggiuntive..."
        rows={2}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
      />

      {/* ── Save button ── */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 active:bg-primary-700"
      >
        Salva misurazione
      </button>

      {/* ── History table ── */}
      {last10.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Ultime misurazioni
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-200/50 dark:border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80 dark:border-white/[0.08] dark:bg-neutral-900/50">
                  <th className="px-3 py-2 font-semibold text-neutral-500 dark:text-neutral-400">Data</th>
                  <th className="px-3 py-2 font-semibold text-neutral-500 dark:text-neutral-400">Peso</th>
                  <th className="px-3 py-2 font-semibold text-neutral-500 dark:text-neutral-400">BF%</th>
                  <th className="px-3 py-2 font-semibold text-neutral-500 dark:text-neutral-400">Note</th>
                  {onDelete && (
                    <th className="px-3 py-2 font-semibold text-neutral-500 dark:text-neutral-400" />
                  )}
                </tr>
              </thead>
              <tbody>
                {last10.map((m, i) => {
                  const prev = last10[i + 1];
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-neutral-50 last:border-0 dark:border-white/[0.06]"
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-neutral-900 dark:text-white">
                        {formatDate(m.date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {m.weight} kg
                        </span>
                        {prev && (
                          <span className="ml-1.5">
                            {diffBadge(m.weight, prev.weight, 'kg', true)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-neutral-600 dark:text-neutral-300">
                        {m.bodyFatPercent != null ? `${m.bodyFatPercent}%` : '—'}
                        {prev?.bodyFatPercent != null && m.bodyFatPercent != null && (
                          <span className="ml-1.5">
                            {diffBadge(m.bodyFatPercent, prev.bodyFatPercent, '%', true)}
                          </span>
                        )}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2 text-neutral-400">
                        {m.notes ?? '—'}
                      </td>
                      {onDelete && (
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => onDelete(m.id)}
                            className="text-neutral-300 transition-colors hover:text-rose-500 dark:text-neutral-600 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
