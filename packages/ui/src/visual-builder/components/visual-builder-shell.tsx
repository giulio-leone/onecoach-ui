'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Plus, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../button';
import { AutosaveIndicator } from './autosave-indicator';
import { cn } from '@giulio-leone/lib-design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../dropdown-menu';

export interface ViewModeItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface WeekData {
  weekNumber: number;
}

export interface DayData {
  dayNumber: number;
  name?: string;
}

export interface VisualBuilderShellProps {
  // Config
  theme: 'primary' | 'emerald';
  title: string;
  onTitleChange: (newTitle: string) => void;
  subtitle: ReactNode;

  // Navigation State
  onBack: () => void;
  isEditMode: boolean;

  // Save State
  isSaving: boolean;
  lastSaved?: Date | null;
  saveError?: Error | null;
  hasPendingChanges: boolean;
  onSave: () => void;
  onSaveNow: () => void;

  // View Config
  viewModes: ViewModeItem[];
  currentViewMode: string;
  onViewModeChange: (modeId: string) => void;

  // Week/Day Navigation (Only visible in Editor mode usually)
  showNavigation?: boolean;
  weeks?: WeekData[];
  currentWeekIndex: number;
  onSelectWeek: (index: number) => void;
  onAddWeek: () => void;

  days?: DayData[];
  currentDayIndex: number;
  onSelectDay: (index: number) => void;
  onAddDay: () => void;
  onRemoveDay: (weekIndex: number, dayIndex: number) => void;

  // Custom Slots
  headerLeftStart?: ReactNode;
  headerActions?: ReactNode;
  headerBottomSlot?: ReactNode;
  mobileActionsMenu?: ReactNode;

  // Custom Labels
  labels?: {
    save?: string;
    saving?: string;
    programNamePlaceholder?: string;
    weekPrefix?: string;
    add?: string;
    dayPrefix?: string; // Used when day.name is missing
    addDay?: string;
  };

  children: ReactNode;
}

export function VisualBuilderShell({
  theme = 'primary',
  title,
  onTitleChange,
  subtitle,
  onBack,
  isEditMode,
  isSaving,
  lastSaved,
  saveError,
  hasPendingChanges,
  onSave,
  onSaveNow,
  viewModes,
  currentViewMode,
  onViewModeChange,
  showNavigation = true,
  weeks = [],
  currentWeekIndex,
  onSelectWeek,
  onAddWeek,
  days = [],
  currentDayIndex,
  onSelectDay,
  onAddDay,
  onRemoveDay,
  headerLeftStart,
  headerActions,
  headerBottomSlot,
  mobileActionsMenu,
  labels,
  children,
}: VisualBuilderShellProps) {
  const l = {
    save: labels?.save || 'Salva',
    saving: labels?.saving || 'Salvataggio...',
    programNamePlaceholder: labels?.programNamePlaceholder || 'Nome Programma',
    weekPrefix: labels?.weekPrefix || 'Settimana',
    add: labels?.add || 'Aggiungi',
    dayPrefix: labels?.dayPrefix || 'Giorno',
    addDay: labels?.addDay || 'Giorno', // Button text
  };

  // Theme configuration
  const themeConfig = {
    primary: {
      header:
        'bg-white/80 border-b border-neutral-200/50 dark:bg-neutral-900/90 dark:border-primary-500/10 backdrop-blur-md dark:shadow-[0_4px_30px_-4px_rgba(99,102,241,0.1)]',
      glow1: 'from-primary-500/20 via-indigo-500/20',
      glow2: 'from-indigo-500/20 via-primary-500/20',
      glow3: 'from-primary-500/10 via-indigo-500/10',
      selection: 'selection:bg-primary-500/30',
      accentColor: 'primary',
      activeTab:
        'bg-white shadow-sm ring-1 ring-neutral-200 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800',
      activeDay:
        'border-primary-500 bg-primary-50/50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200',
      activeDayGlow: 'from-primary-500/10',
      addBtnText: 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20',
      viewModeActive:
        'bg-neutral-50 shadow-sm ring-1 ring-neutral-200 dark:bg-primary-600 dark:ring-0',
      viewModeActiveText: 'text-primary-700 dark:text-white',
      pulseDot: 'bg-primary-500',
    },
    emerald: {
      header:
        'bg-white/80 border-b border-neutral-200/50 dark:bg-neutral-900/90 dark:border-emerald-500/10 backdrop-blur-md dark:shadow-[0_4px_30px_-4px_rgba(16,185,129,0.1)]',
      glow1: 'from-emerald-500/20 via-teal-500/20',
      glow2: 'from-teal-500/20 via-emerald-500/20',
      glow3: 'from-emerald-500/10 via-teal-500/10',
      selection: 'selection:bg-emerald-500/30',
      accentColor: 'emerald',
      activeTab:
        'bg-white shadow-sm ring-1 ring-neutral-200 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
      activeDay:
        'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200',
      activeDayGlow: 'from-emerald-500/10',
      addBtnText:
        'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20',
      viewModeActive:
        'bg-neutral-50 shadow-sm ring-1 ring-neutral-200 dark:bg-emerald-600 dark:ring-0',
      viewModeActiveText: 'text-emerald-700 dark:text-white',
      pulseDot: 'bg-emerald-500',
    },
  }[theme];

  return (
    <div
      className={cn(
        'relative min-h-[100dvh] w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50',
        themeConfig.selection
      )}
    >
      {/* Atmosphere / Background Glows - Subtler & Light Mode Compatible */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-br to-transparent opacity-40 blur-[120px] dark:opacity-20',
            themeConfig.glow1
          )}
        />
        <div
          className={cn(
            'absolute top-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl to-transparent opacity-40 blur-[100px] dark:opacity-20',
            themeConfig.glow2
          )}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-[100dvh]">
        {/* Header - Sticky with semantic glass effect */}
        <header
          className={cn(
            'sticky top-0 z-[1020] p-3 transition-all duration-300 sm:px-6 sm:py-4',
            themeConfig.header
          )}
        >
          {/* Top Bar: View Mode + Actions */}
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mr-2 hidden items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 sm:flex dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                </button>
              )}

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-full bg-neutral-100/50 p-1 ring-1 ring-neutral-200 dark:bg-neutral-900/50 dark:ring-white/10">
                {viewModes.map((mode: any) => (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange(mode.id)}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all sm:gap-2 sm:px-3',
                      currentViewMode === mode.id
                        ? themeConfig.viewModeActiveText
                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    )}
                  >
                    {currentViewMode === mode.id && (
                      <div
                        className={cn(
                          'absolute inset-0 -z-10 rounded-full',
                          themeConfig.viewModeActive
                        )}
                      />
                    )}
                    <mode.icon size={14} />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Optional Bottom/Middle Slot */}
              {headerBottomSlot && <div className="hidden md:block">{headerBottomSlot}</div>}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <div className="hidden items-center gap-2 sm:flex">{headerActions}</div>

              {/* Mobile Menu Action */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Inject actions as menu items */}
                    <div className="p-1 sm:hidden">
                      {mobileActionsMenu ? (
                        mobileActionsMenu
                      ) : (
                        <div className="p-2 text-xs text-neutral-400">No extra actions</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Centralized Save Button Section */}
              <div className="ml-2 flex items-center gap-2 border-l border-neutral-200 pl-4 dark:border-white/10">
                {isEditMode && (
                  <AutosaveIndicator
                    isSaving={isSaving}
                    lastSaved={lastSaved ?? null}
                    error={saveError ?? null}
                    hasPendingChanges={hasPendingChanges}
                    onRetry={onSaveNow}
                  />
                )}
                <Button
                  variant="secondary"
                  onPress={onSave}
                  className={cn(
                    'h-9 px-3 text-sm font-medium transition-all duration-300 sm:px-5',
                    'border border-neutral-200 bg-neutral-50 text-neutral-900 shadow-sm hover:bg-neutral-100',
                    'dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10'
                  )}
                >
                  {isSaving ? l.saving : l.save}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
              {/* Title Section */}
              <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  {headerLeftStart}
                  <input
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
                    placeholder={l.programNamePlaceholder}
                    className={cn(
                      'w-full bg-transparent text-xl font-bold tracking-tight outline-none sm:text-4xl',
                      'text-neutral-900 placeholder:text-neutral-300 dark:text-white dark:placeholder:text-white/20',
                      'transition-all duration-200',
                      themeConfig.selection
                    )}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 animate-pulse rounded-full',
                      themeConfig.pulseDot
                    )}
                  />
                  {subtitle}
                </div>
              </div>

              {/* Week Tabs */}
              {showNavigation && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2">
                    {weeks.map((week, index) => (
                      <button
                        key={week.weekNumber || index}
                        onClick={() => onSelectWeek(index)}
                        className={cn(
                          'flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300',
                          currentWeekIndex === index
                            ? themeConfig.activeTab
                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/5 dark:hover:text-neutral-300'
                        )}
                      >
                        {l.weekPrefix} {week.weekNumber}
                      </button>
                    ))}
                    <button
                      onClick={onAddWeek}
                      className={cn(
                        'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        themeConfig.addBtnText
                      )}
                    >
                      <Plus size={12} />
                      <span>{l.add}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Day Tabs */}
            {showNavigation && (
              <div className="animate-in fade-in slide-in-from-bottom-2 delay-75 duration-500">
                <div className="scrollbar-none item-center flex gap-1 overflow-x-auto pb-0">
                  {days.map((day, index) => (
                    <button
                      key={day.dayNumber || index}
                      onClick={() => onSelectDay(index)}
                      className={cn(
                        'group relative flex-shrink-0 rounded-t-xl border-b-2 px-4 py-2 text-sm font-medium transition-all duration-300',
                        currentDayIndex === index
                          ? themeConfig.activeDay
                          : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-white/[0.01] dark:hover:text-neutral-300'
                      )}
                    >
                      <span className="relative z-10 truncate">
                        {day.name || `${l.dayPrefix} ${day.dayNumber}`}
                      </span>

                      {/* Active Glow Effect */}
                      {currentDayIndex === index && (
                        <div
                          className={cn(
                            'absolute inset-0 bg-gradient-to-t to-transparent opacity-50',
                            themeConfig.activeDayGlow
                          )}
                        />
                      )}

                      {days.length > 1 && currentDayIndex === index && (
                        <span
                          onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.stopPropagation();
                            onRemoveDay(currentWeekIndex, index);
                          }}
                          className="relative z-20 ml-2 inline-flex items-center rounded-sm p-0.5 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={onAddDay}
                    className="mb-[2px] flex h-full items-center rounded-t-xl px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/[0.02] dark:hover:text-neutral-300"
                  >
                    <Plus size={14} className="mr-1" />
                    {l.addDay}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="touch-pan-y">{children}</main>
      </div>
    </div>
  );
}
