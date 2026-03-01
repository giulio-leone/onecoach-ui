'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity,
  BarChart3,
  Zap,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@giulio-leone/ui';
import { Button } from '@giulio-leone/ui';
import { Badge } from '../../badge';

// --- Local types (UI decoupled from backend) ---

export interface AdaptationSignal {
  type: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SuggestedChange {
  type: string;
  description: string;
  before?: string;
  after?: string;
}

export interface StrengthChange {
  exerciseName: string;
  changePercent: number;
  trend: string;
}

export interface AdaptationAnalysis {
  completionRate: number;
  averageRPE: number;
  overallTrend: 'improving' | 'stagnating' | 'declining';
  strengthChanges: StrengthChange[];
}

export interface AdaptationPlan {
  id: string;
  signals: AdaptationSignal[];
  suggestedChanges: SuggestedChange[];
  analysis: AdaptationAnalysis;
  status: 'pending' | 'approved' | 'applied' | 'rejected';
}

export interface AdaptationPreviewProps {
  plan: AdaptationPlan;
  onApprove: () => void;
  onReject: () => void;
  className?: string;
}

// --- Helpers ---

const priorityBadgeVariant: Record<AdaptationSignal['priority'], 'error' | 'warning' | 'success'> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const trendIcon: Record<AdaptationAnalysis['overallTrend'], React.ReactNode> = {
  improving: <TrendingUp size={16} className="text-emerald-500" />,
  stagnating: <Minus size={16} className="text-amber-500" />,
  declining: <TrendingDown size={16} className="text-red-500" />,
};

const trendLabel: Record<AdaptationAnalysis['overallTrend'], string> = {
  improving: 'Improving',
  stagnating: 'Stagnating',
  declining: 'Declining',
};

// --- Sub-components ---

function AnalysisSummary({ analysis }: { analysis: AdaptationAnalysis }) {
  return (
    <Card variant="bordered" padding="sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 size={18} className="text-primary-500" />
          Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Completion</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {Math.round(analysis.completionRate * 100)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Avg RPE</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {analysis.averageRPE.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Trend</p>
            <div className="flex items-center gap-1.5">
              {trendIcon[analysis.overallTrend]}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {trendLabel[analysis.overallTrend]}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Strength Δ
            </p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {analysis.strengthChanges.length > 0
                ? `${analysis.strengthChanges.length} exercises`
                : '—'}
            </p>
          </div>
        </div>

        {/* Strength changes detail */}
        {analysis.strengthChanges.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Strength Changes
            </p>
            <div className="space-y-1.5">
              {analysis.strengthChanges.map((sc) => (
                <div
                  key={sc.exerciseName}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-white/[0.05]"
                >
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {sc.exerciseName}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      sc.changePercent > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : sc.changePercent < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-neutral-500'
                    )}
                  >
                    {sc.changePercent > 0 ? '+' : ''}
                    {sc.changePercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SignalList({ signals }: { signals: AdaptationSignal[] }) {
  if (signals.length === 0) return null;

  return (
    <Card variant="bordered" padding="sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity size={18} className="text-primary-500" />
          Adaptation Signals
        </CardTitle>
        <CardDescription>{signals.length} signal{signals.length !== 1 ? 's' : ''} detected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {signals.map((signal, i) => (
            <div
              key={`${signal.type}-${i}`}
              className="flex items-start gap-3 rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <Badge variant={priorityBadgeVariant[signal.priority]} size="sm">
                {signal.priority}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {signal.type}
                </p>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {signal.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestedChangesList({ changes }: { changes: SuggestedChange[] }) {
  if (changes.length === 0) return null;

  return (
    <Card variant="bordered" padding="sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap size={18} className="text-primary-500" />
          Suggested Changes
        </CardTitle>
        <CardDescription>
          {changes.length} modification{changes.length !== 1 ? 's' : ''} proposed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {changes.map((change, i) => (
            <div
              key={`${change.type}-${i}`}
              className="rounded-lg border border-neutral-200/60 p-3 dark:border-white/[0.08]"
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="default" size="sm">
                  {change.type}
                </Badge>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {change.description}
                </span>
              </div>
              {(change.before || change.after) && (
                <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2.5 text-sm dark:bg-white/[0.05]">
                  {change.before && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 line-through dark:bg-red-900/30 dark:text-red-300">
                      {change.before}
                    </span>
                  )}
                  {change.before && change.after && (
                    <ArrowRight size={14} className="flex-shrink-0 text-neutral-400" />
                  )}
                  {change.after && (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {change.after}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---

export const AdaptationPreview: React.FC<AdaptationPreviewProps> = ({
  plan,
  onApprove,
  onReject,
  className,
}) => {
  const isPending = plan.status === 'pending';

  const statusBadge: Record<AdaptationPlan['status'], { variant: 'warning' | 'success' | 'info' | 'error'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending Review' },
    approved: { variant: 'success', label: 'Approved' },
    applied: { variant: 'info', label: 'Applied' },
    rejected: { variant: 'error', label: 'Rejected' },
  };

  const { variant, label } = statusBadge[plan.status];

  return (
    <Card variant="default" padding="none" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-primary-500" />
            Adaptation Preview
          </CardTitle>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <CardDescription>
          Review the proposed adaptations based on your training data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnalysisSummary analysis={plan.analysis} />
        <SignalList signals={plan.signals} />
        <SuggestedChangesList changes={plan.suggestedChanges} />
      </CardContent>

      {isPending && (
        <CardFooter className="flex-wrap gap-2">
          <Button variant="primary" icon={CheckCircle2} onClick={onApprove}>
            Approve &amp; Apply
          </Button>
          <Button variant="danger" icon={XCircle} onClick={onReject}>
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

AdaptationPreview.displayName = 'AdaptationPreview';
