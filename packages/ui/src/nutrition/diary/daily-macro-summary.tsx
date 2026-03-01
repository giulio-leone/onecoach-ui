'use client';

import { useMemo } from 'react';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyMacroSummaryProps {
  consumed: MacroTarget;
  target: MacroTarget;
  className?: string;
}

interface RingProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor: string;
}

function ProgressRing({ value, max, size, strokeWidth, color, bgColor }: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1.5) : 0;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

const MACRO_CONFIG = [
  { key: 'calories' as const, label: 'kcal', icon: Flame, color: '#f97316', bg: 'rgba(249,115,22,0.15)', ring: '#f97316', ringBg: 'rgba(249,115,22,0.1)' },
  { key: 'protein' as const, label: 'g', icon: Beef, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', ring: '#ef4444', ringBg: 'rgba(239,68,68,0.1)' },
  { key: 'carbs' as const, label: 'g', icon: Wheat, color: '#eab308', bg: 'rgba(234,179,8,0.15)', ring: '#eab308', ringBg: 'rgba(234,179,8,0.1)' },
  { key: 'fats' as const, label: 'g', icon: Droplets, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', ring: '#3b82f6', ringBg: 'rgba(59,130,246,0.1)' },
];

export function DailyMacroSummary({ consumed, target, className }: DailyMacroSummaryProps) {
  const macros = useMemo(
    () =>
      MACRO_CONFIG.map((cfg) => ({
        ...cfg,
        consumed: Math.round(consumed[cfg.key]),
        target: Math.round(target[cfg.key]),
        remaining: Math.max(0, Math.round(target[cfg.key] - consumed[cfg.key])),
        over: Math.max(0, Math.round(consumed[cfg.key] - target[cfg.key])),
      })),
    [consumed, target],
  );

  return (
    <div className={cn('rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 backdrop-blur-md', className)}>
      {/* Main calorie ring */}
      <div className="mb-4 flex items-center justify-center">
        <div className="relative">
          <ProgressRing
            value={macros[0].consumed}
            max={macros[0].target}
            size={120}
            strokeWidth={8}
            color={macros[0].ring}
            bgColor={macros[0].ringBg}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{macros[0].remaining}</span>
            <span className="text-[10px] text-neutral-400">
              {macros[0].over > 0 ? 'over' : 'remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* Macro row */}
      <div className="grid grid-cols-3 gap-3">
        {macros.slice(1).map((m) => (
          <div key={m.key} className="flex flex-col items-center gap-1">
            <div className="relative">
              <ProgressRing
                value={m.consumed}
                max={m.target}
                size={56}
                strokeWidth={4}
                color={m.ring}
                bgColor={m.ringBg}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <m.icon size={16} style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">
                {m.consumed}<span className="text-neutral-500">/{m.target}</span>
              </div>
              <div className="text-[10px] text-neutral-500">{m.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
