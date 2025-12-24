'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../button';
import { AutosaveIndicator } from './autosave-indicator';
import { cn } from '@onecoach/lib-design-system';

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
  headerLeftStart?: ReactNode; // Before / Name
  headerActions?: ReactNode; // Middle right (1RM, Import, etc)
  headerBottomSlot?: ReactNode; // e.g. Macro summary
  
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
  children
}: VisualBuilderShellProps) {

  // Theme configuration
  const themeConfig = {
    primary: {
      glow1: 'from-primary-900/40 via-secondary-900/20',
      glow2: 'from-secondary-800/30 via-primary-900/20',
      glow3: 'from-primary-950/40 via-secondary-900/10',
      selection: 'selection:bg-primary-500/30',
      accentColor: 'primary',
      activeTab: 'bg-primary-600/20 text-primary-200 ring-primary-500/30 shadow-[0_0_15px_-3px_rgba(37,99,235,0.3)] ring-1',
      activeDay: 'border-primary-500 bg-white/[0.03] text-white',
      activeDayGlow: 'from-primary-500/10',
      addBtnText: 'text-primary-400 hover:bg-primary-500/10',
      viewModeActive: 'bg-primary-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]',
      pulseDot: 'bg-secondary-500'
    },
    emerald: {
      glow1: 'from-emerald-900/40 via-teal-900/20',
      glow2: 'from-teal-800/30 via-emerald-900/20',
      glow3: 'from-emerald-950/40 via-teal-900/10',
      selection: 'selection:bg-emerald-500/30',
      accentColor: 'emerald',
      activeTab: 'bg-emerald-600/20 text-emerald-200 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30',
      activeDay: 'border-emerald-500 bg-white/[0.03] text-white',
      activeDayGlow: 'from-emerald-500/10',
      addBtnText: 'text-emerald-400 hover:bg-emerald-500/10',
      viewModeActive: 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      pulseDot: 'bg-emerald-500'
    }
  }[theme];

  return (
    <div className={cn("relative min-h-[100dvh] w-full bg-neutral-950 text-neutral-50", themeConfig.selection)}>
      {/* Atmosphere / Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="magic-shimmer absolute inset-0 opacity-20" />
        <div
          className={cn(
            "absolute -top-[15%] -left-[15%] h-[900px] w-[900px] animate-pulse rounded-full bg-gradient-to-br to-transparent mix-blend-screen blur-[150px]",
            themeConfig.glow1
          )}
          style={{ animationDuration: '8s' }}
        />
        <div className={cn(
          "absolute top-[15%] -right-[15%] h-[700px] w-[700px] rounded-full bg-gradient-to-bl to-transparent mix-blend-screen blur-[130px]",
          themeConfig.glow2
        )} />
        <div className={cn(
          "absolute bottom-[-10%] left-[10%] h-[600px] w-[900px] rounded-full bg-gradient-to-t to-transparent blur-[140px]",
          themeConfig.glow3
        )} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-[100dvh] bg-neutral-950/30 backdrop-blur-3xl">
        {/* Header - Sticky with premium glass effect */}
        <header className="glass-strong shadow-glow-sm sticky top-0 z-[1020] border-b-0 border-b-white/5 p-3 sm:px-6 sm:py-4">
          
          {/* Top Bar: View Mode + Actions */}
          <div className="mb-2 flex items-center justify-between gap-4 sm:mb-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                   onClick={onBack}
                   className="mr-2 hidden items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-white sm:flex"
                >
                  <ArrowLeft size={16} />
                </button>
              )}

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-full bg-neutral-950/50 p-1 ring-1 ring-white/10 backdrop-blur-md">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange(mode.id)}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all sm:gap-2 sm:px-3',
                      currentViewMode === mode.id
                        ? 'text-white shadow-lg'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                    )}
                  >
                    {currentViewMode === mode.id && (
                      <div className={cn("absolute inset-0 -z-10 rounded-full", themeConfig.viewModeActive)} />
                    )}
                    <mode.icon size={14} />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

               {/* Optional Bottom/Middle Slot (e.g. Live Macro Summary) gets placed here on desktop to save space if desired, or can be passed in right actions */}
               {headerBottomSlot && (
                 <div className="hidden md:block">
                   {headerBottomSlot}
                 </div>
               )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {headerActions}

              {/* Centralized Save Button Section */}
              <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-4">
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
                      'h-9 px-5 text-sm font-medium transition-all duration-300',
                      'glass-strong shadow-glow-sm border border-white/20',
                      'bg-gradient-to-br from-white/10 to-white/5',
                      'hover:shadow-glow hover:scale-[1.02] hover:border-white/30 hover:bg-white/20',
                      'active:scale-[0.98]',
                      'text-white'
                    )}
                  >
                    {isSaving ? 'Salvataggio...' : 'Salva'}
                  </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              {/* Title Section */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {headerLeftStart}
                  <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Nome Programma"
                    className={cn(
                      'w-full bg-transparent text-2xl font-bold tracking-tight text-white outline-none placeholder:text-white/20 sm:text-4xl',
                      'transition-all duration-200 focus:placeholder:text-white/10',
                      themeConfig.selection
                    )}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                  <span className={cn("inline-block h-1.5 w-1.5 animate-pulse rounded-full", themeConfig.pulseDot)} />
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
                            : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
                        )}
                      >
                        Settimana {week.weekNumber}
                      </button>
                    ))}
                    <button
                      onClick={onAddWeek}
                      className={cn("flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", themeConfig.addBtnText)}
                    >
                      <Plus size={12} />
                      <span>Aggiungi</span>
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
                          : 'border-transparent text-neutral-500 hover:bg-white/[0.01] hover:text-neutral-300'
                      )}
                    >
                      <span className="relative z-10 truncate">{day.name || `Giorno ${day.dayNumber}`}</span>

                      {/* Active Glow Effect */}
                      {currentDayIndex === index && (
                        <div className={cn("absolute inset-0 bg-gradient-to-t to-transparent opacity-50", themeConfig.activeDayGlow)} />
                      )}

                      {(days.length > 1 && currentDayIndex === index) && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveDay(currentWeekIndex, index);
                          }}
                          className="relative z-20 ml-2 inline-flex items-center rounded-sm p-0.5 text-neutral-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={onAddDay}
                    className="mb-[2px] flex h-full items-center rounded-t-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-white/[0.02] hover:text-neutral-400"
                  >
                    <Plus size={14} className="mr-1" />
                    Giorno
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="touch-pan-y">
          {children}
        </main>
      </div>
    </div>
  );
}

