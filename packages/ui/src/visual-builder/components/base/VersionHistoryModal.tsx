/**
 * VersionHistoryModal Component
 *
 * Modal displaying version history with restore and diff capabilities.
 * Seamlessly integrates with existing onecoach-ui design patterns.
 */

'use client';

import { useState, useMemo } from 'react';
import { X, RotateCcw, GitCompare, Clock, Check } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import type { VersionSnapshot, StateDiff } from '@giulio-leone/hooks';
import { computeSemanticDiff } from '../../utils';

export interface VersionHistoryModalProps<T = unknown> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** List of version snapshots */
  history: VersionSnapshot<T>[];
  /** Restore to a specific version index */
  onRestore: (index: number) => void;
  /** Get diff between two versions (indices, -1 = current) */
  getDiff?: (fromIndex: number, toIndex: number) => StateDiff;
  /** Theme variant */
  variant?: 'primary' | 'emerald';
  /** Translations */
  labels?: {
    title?: string;
    noHistory?: string;
    current?: string;
    restore?: string;
    compare?: string;
    cancel?: string;
    version?: string;
    changes?: string;
    added?: string;
    removed?: string;
    modified?: string;
  };
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VersionHistoryModal<T>({
  isOpen,
  onClose,
  history,
  onRestore,
  getDiff,
  variant = 'primary',
  labels = {},
}: VersionHistoryModalProps<T>) {
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const accentClass =
    variant === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-primary-600 dark:text-primary-400';

  const diff = useMemo(() => {
    if (!showDiff || selectedForCompare.length !== 2 || !getDiff) return null;
    const sorted = [...selectedForCompare].sort((a, b) => a - b);
    const newerIdx = sorted[0] ?? 0;
    const olderIdx = sorted[1] ?? 0;
    // Compare Older -> Newer to show progress (Added = appeared in update)
    return getDiff(olderIdx, newerIdx);
  }, [showDiff, selectedForCompare, getDiff]);

  const semanticDiff = useMemo(() => {
    if (!diff || selectedForCompare.length !== 2) return null;
    const sorted = [...selectedForCompare].sort((a, b) => a - b);
    const newerIdx = sorted[0] ?? 0;
    const olderIdx = sorted[1] ?? 0;

    return computeSemanticDiff(diff, history[olderIdx]?.state as Record<string, unknown>, history[newerIdx]?.state as Record<string, unknown>);
  }, [diff, selectedForCompare, history]);

  const toggleCompareSelection = (index: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i: any) => i !== index);
      }
      if (prev.length >= 2) {
        return [prev[1] ?? index, index];
      }
      return [...prev, index];
    });
    setShowDiff(false);
  };

  const handleRestore = (index: number) => {
    onRestore(index);
    onClose();
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      setShowDiff(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg overflow-hidden rounded-2xl',
          'border border-neutral-200/60 bg-white shadow-2xl',
          'dark:border-white/10 dark:bg-zinc-950',
          'animate-in zoom-in-95 fade-in duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-4 dark:border-white/10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
            <Clock size={20} className={accentClass} />
            {labels.title ?? 'Version History'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {history.length === 0 ? (
            <p className="py-8 text-center text-neutral-500 dark:text-neutral-400">
              {labels.noHistory ?? 'No version history available'}
            </p>
          ) : showDiff && diff ? (
            // Diff View
            <div className="space-y-4">
              <button
                onClick={() => setShowDiff(false)}
                className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                ← Back to history
              </button>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-500">
                  Comparing Version{' '}
                  {history.length - (selectedForCompare.sort((a, b) => a - b)[1] ?? 0)} vs{' '}
                  {history.length - (selectedForCompare.sort((a, b) => a - b)[0] ?? 0)}
                </h3>
                <button
                  onClick={() => {
                    const olderIdx = [...selectedForCompare].sort((a, b) => a - b)[1];
                    if (olderIdx !== undefined) {
                      handleRestore(olderIdx);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                    'dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20'
                  )}
                >
                  <RotateCcw size={14} />
                  Restore Original
                </button>
              </div>

              <div className="rounded-xl border border-neutral-200/60 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                {!semanticDiff || semanticDiff.length === 0 ? (
                  <p className="text-center text-neutral-500">No differences found</p>
                ) : (
                  <div className="space-y-3">
                    {semanticDiff.map((change: any) => (
                      <div
                        key={change.id}
                        className="relative overflow-hidden rounded-lg border border-neutral-200/60 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-white/[0.04]"
                      >
                        {/* Status Bar */}
                        <div
                          className={cn(
                            'absolute top-0 bottom-0 left-0 w-1',
                            change.action === 'added'
                              ? 'bg-emerald-500'
                              : change.action === 'removed'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                          )}
                        />

                        <div className="ml-3">
                          {/* Context (Parent) */}
                          {change.entity.parentName && (
                            <div className="mb-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                              {change.entity.parentName}
                            </div>
                          )}

                          {/* Main Entity Header */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {change.entity.type === 'program'
                                ? '📋'
                                : change.entity.type === 'week'
                                  ? '📅'
                                  : change.entity.type === 'day'
                                    ? '📆'
                                    : change.entity.type === 'exercise'
                                      ? '🏋️'
                                      : change.entity.type === 'set'
                                        ? '🔢'
                                        : '•'}
                            </span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {change.entity.name}
                            </span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                change.action === 'added'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : change.action === 'removed'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              )}
                            >
                              {change.action}
                            </span>
                          </div>

                          {/* Description */}
                          {/* <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                             {change.description}
                           </p> */}

                          {/* Details List */}
                          {change.details.length > 0 && (
                            <div className="mt-3">
                              {/* Headers for Desktop */}
                              <div className="hidden grid-cols-2 gap-4 border-b border-neutral-100 pb-1 text-xs font-medium text-neutral-400 sm:grid dark:border-white/5 dark:text-neutral-500">
                                <div>PREVIOUS</div>
                                <div className="border-l border-neutral-100 pl-4 dark:border-white/5">
                                  CURRENT
                                </div>
                              </div>

                              <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                {change.details.map((detail: any, idx: any) => (
                                  <div
                                    key={idx}
                                    className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-2 sm:gap-4"
                                  >
                                    {/* Left Column (Previous) */}
                                    <div className="flex flex-col sm:block">
                                      <span className="mb-0.5 text-[10px] font-medium text-neutral-400 sm:hidden">
                                        PREVIOUS
                                      </span>
                                      <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                          {detail.label}
                                        </span>
                                        <span className="text-sm font-medium text-red-600/80 line-through decoration-red-600/50 dark:text-red-400/80">
                                          {formatValue(detail.from)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right Column (Current) */}
                                    {change.action !== 'removed' && (
                                      <div className="flex flex-col border-l border-neutral-100 pl-0 sm:pl-4 dark:border-white/5">
                                        <span className="mt-1 mb-0.5 text-[10px] font-medium text-neutral-400 sm:hidden">
                                          CURRENT
                                        </span>
                                        <div className="flex items-baseline justify-between gap-2">
                                          <span className="text-sm text-neutral-500 sm:hidden dark:text-neutral-400">
                                            {detail.label}
                                          </span>
                                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {formatValue(detail.to)}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // History List
            <div className="space-y-2">
              {history.map((version, index) => {
                const isCurrent = index === 0;
                const isSelected = selectedForCompare.includes(index);

                return (
                  <div
                    key={index}
                    className={cn(
                      'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                        : 'border-transparent hover:bg-neutral-50 dark:hover:bg-white/5'
                    )}
                    onClick={() => toggleCompareSelection(index)}
                  >
                    <div className="relative mt-1">
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                          <Check size={12} />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-neutral-300 group-hover:border-neutral-400 dark:border-white/[0.1]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {version.description ||
                            (index === 0 ? 'Current Version' : `Version ${history.length - index}`)}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{formatTimestamp(new Date(version.timestamp))}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation();
                          handleRestore(index);
                        }}
                        className="rounded p-1.5 hover:bg-neutral-200 dark:hover:bg-white/10"
                        title={labels.restore ?? 'Restore this version'}
                      >
                        <RotateCcw size={16} className="text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200/60 bg-neutral-50 px-6 py-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {selectedForCompare.length === 2
              ? '2 versions selected'
              : `${selectedForCompare.length} selected for compare`}
          </div>
          {selectedForCompare.length === 2 && !showDiff && (
            <button
              onClick={handleCompare}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                variant === 'emerald'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              )}
            >
              <GitCompare size={16} />
              {labels.compare ?? 'Compare Versions'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'empty';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object') return '...';
  return String(val);
}
