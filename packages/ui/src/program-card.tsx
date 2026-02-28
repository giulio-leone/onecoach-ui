/**
 * ProgramCard Component
 *
 * Generic, reusable card for displaying workout/nutrition programs.
 * Follows SOLID principles with composable props for different domains.
 * Premium Dark design system with theme color support.
 */

'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

/* =============================================================================
   Types
============================================================================= */

export interface ProgramCardStat {
  icon: ReactNode;
  label: string;
  value: string;
}

export interface ProgramCardAction {
  icon: ReactNode;
  title: string;
  colorOnHover?: 'blue' | 'emerald' | 'rose';
  href?: string;
  onClick?: () => void;
}

export interface ProgramCardLabels {
  noDescription: string;
}

export interface ProgramCardProps {
  /** Unique identifier for the program */
  id: string;
  /** Program name/title */
  name: string;
  /** Optional description (will be truncated to 2 lines) */
  description?: string | null;
  /** Navigation URL when card is clicked */
  href: string;
  /** Badge text shown in header (e.g., difficulty, goal) */
  badge?: string;
  /** Icon displayed in header (should be a Lucide icon component) */
  icon: ReactNode;
  /** Color theme for gradients and accents */
  colorTheme: 'blue' | 'emerald';
  /** Stats to display in stacked layout */
  stats: ProgramCardStat[];
  /** Action buttons for footer */
  actions?: ProgramCardAction[];
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Whether selection mode is active (shows checkbox) */
  selectionMode?: boolean;
  /** Callback when card selection is toggled (long-press or checkbox click) */
  onToggleSelect?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Localized labels */
  labels?: ProgramCardLabels;
}

/* =============================================================================
   Theme Configuration
============================================================================= */

const themeConfig = {
  blue: {
    iconBg: 'border-primary-500/20 bg-primary-500/10 text-primary-400',
    glowPrimary: 'bg-primary-500/10 group-hover:bg-primary-500/20',
    glowSecondary: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
    hoverRing: 'hover:ring-primary-500/50',
    selectionRing: 'ring-primary-400/80',
    selectionCheckbox: 'border-primary-400 bg-primary-500',
  },
  emerald: {
    iconBg: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    glowPrimary: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    glowSecondary: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    hoverRing: 'hover:ring-emerald-500/50',
    selectionRing: 'ring-emerald-400/80',
    selectionCheckbox: 'border-emerald-400 bg-emerald-500',
  },
} as const;

const actionHoverColors = {
  blue: 'hover:border-primary-500/30 hover:bg-primary-500/20 hover:text-primary-400',
  emerald: 'hover:border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-400',
  rose: 'hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400',
} as const;

/* =============================================================================
   Component
============================================================================= */

const DEFAULT_LABELS: ProgramCardLabels = {
  noDescription: 'Nessuna descrizione disponibile.',
};

export function ProgramCard({
  id,
  name,
  description,
  href,
  badge,
  icon,
  colorTheme,
  stats,
  actions = [],
  isSelected = false,
  selectionMode = false,
  onToggleSelect,
  className,
  labels = DEFAULT_LABELS,
}: ProgramCardProps) {
  const router = useRouter();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = themeConfig[colorTheme];

  /* ---------------------------------------------------------------------------
     Long Press & Click Handlers
  --------------------------------------------------------------------------- */

  const clearTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = () => {
    if (!onToggleSelect) return;
    clearTimer();
    longPressTimer.current = setTimeout(() => {
      onToggleSelect(id);
    }, 450);
  };

  const handlePointerUp = () => {
    clearTimer();
  };

  const isActionClick = (target: EventTarget | null) => {
    return target instanceof HTMLElement && Boolean(target.closest('[data-card-action="true"]'));
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    // In selection mode, toggle selection instead of navigating
    if (selectionMode && onToggleSelect) {
      if (isActionClick(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(id);
      return;
    }
    // Don't navigate if clicking on action buttons
    if (isActionClick(e.target)) return;
    // Navigate to program
    router.push(href);
  };

  /* ---------------------------------------------------------------------------
     Render
  --------------------------------------------------------------------------- */

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        'min-h-[280px] w-full',
        'bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-xl shadow-black/20',
        'border border-neutral-700/40',
        theme.hoverRing,
        isSelected && `ring-2 ${theme.selectionRing}`,
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {(selectionMode || isSelected) && (
        <div
          className={cn(
            'absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200',
            isSelected
              ? `scale-110 ${theme.selectionCheckbox} text-white`
              : 'border-white/30 bg-black/20 backdrop-blur-sm'
          )}
        >
          {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
        </div>
      )}

      {/* Decorative Glow */}
      <div
        className={cn(
          'absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-opacity',
          theme.glowPrimary
        )}
      />
      <div
        className={cn(
          'absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl transition-opacity',
          theme.glowSecondary
        )}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header: Icon & Badge */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border shadow-inner backdrop-blur-md',
              theme.iconBg
            )}
          >
            {icon}
          </div>

          {badge && (
            <span className="inline-flex items-center rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              {badge}
            </span>
          )}
        </div>

        {/* Content: Title & Description */}
        <div className="mb-5 flex-1">
          <h3 className="mb-2 text-xl leading-tight font-bold break-words text-white">{name}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
            {description || labels.noDescription}
          </p>
        </div>

        {/* Stats - Stacked Layout */}
        <div className="mb-5 flex flex-col gap-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="flex-shrink-0">{stat.icon}</span>
                <span className="text-[10px] font-bold tracking-wide uppercase">{stat.label}</span>
              </div>
              <span className="ml-auto text-sm font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Actions */}
      {actions.length > 0 && (
        <div className="relative z-10 mt-auto flex items-center justify-end gap-1.5 border-t border-white/10 pt-4">
          {actions.map((action, index) => {
            const hoverColor = actionHoverColors[action.colorOnHover || colorTheme];
            const baseClasses = cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-neutral-400 transition-all',
              hoverColor
            );

            if (action.href) {
              return (
                <Link
                  key={index}
                  href={action.href}
                  data-card-action="true"
                  className={baseClasses}
                  title={action.title}
                  onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                >
                  {action.icon}
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                data-card-action="true"
                className={baseClasses}
                title={action.title}
              >
                {action.icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
