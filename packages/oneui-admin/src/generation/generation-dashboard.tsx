'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  useWorkflowRuns,
  type WorkflowRun,
  type WorkflowRunStatus,
} from '@onecoach/hooks';
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  PlayCircle,
  Trash2,
  Filter,
  X,
  FileJson,
} from 'lucide-react';

/**
 * Status color mapping
 */
const statusColors: Record<WorkflowRunStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
};

/**
 * Status icon mapping
 */
const StatusIcon = ({ status }: { status: WorkflowRunStatus }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'running':
      return <PlayCircle className="h-4 w-4 animate-pulse" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    case 'cancelled':
      return <Ban className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

/**
 * Stat Card Component
 */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className={`rounded-xl border ${color} p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-50" />
      </div>
    </div>
  );
}

/**
 * Run Row Component
 */
function RunRow({
  run,
  onCancel,
  isCancelling,
  onClick,
}: {
  run: WorkflowRun;
  onCancel: (runId: string) => Promise<void>;
  isCancelling: boolean;
  onClick: (run: WorkflowRun) => void;
}) {
  const canCancel = run.status === 'pending' || run.status === 'running';

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const getDuration = () => {
    if (!run.started_at) return '-';
    const start = new Date(run.started_at).getTime();
    const end = run.completed_at ? new Date(run.completed_at).getTime() : Date.now();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div 
      onClick={() => onClick(run)}
      className="flex items-center gap-4 rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-4 hover:bg-neutral-800/70 transition-colors cursor-pointer group"
    >
      {/* Status Badge */}
      <div
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusColors[run.status]}`}
      >
        <StatusIcon status={run.status} />
        {run.status}
      </div>

      {/* Workflow Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-100 truncate group-hover:text-white transition-colors">
          {run.workflow_name || run.run_id}
        </p>
        <p className="text-xs text-neutral-500 truncate">{run.run_id}</p>
      </div>

      {/* Timing */}
      <div className="hidden md:block text-right">
        <p className="text-sm text-neutral-300">{formatDate(run.created_at)}</p>
        <p className="text-xs text-neutral-500">Duration: {getDuration()}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {canCancel && (
          <button
            onClick={() => onCancel(run.run_id)}
            disabled={isCancelling}
            className="rounded-lg p-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Cancel workflow"
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Details Modal
 */
function RunDetailsModal({ run, onClose }: { run: WorkflowRun; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${statusColors[run.status].split(' ')[0]} ${statusColors[run.status].split(' ')[2]}`}>
              <StatusIcon status={run.status} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">{run.workflow_name || 'Workflow Run'}</h2>
              <p className="text-sm text-neutral-500">{run.run_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 overflow-y-auto p-6 md:grid-cols-2 gap-6 max-h-[calc(90vh-80px)]">
          {/* Metadata */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-400 uppercase tracking-wider">Metadata</h3>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-500">Deployment ID</span>
                  <span className="font-mono text-sm text-neutral-300">{run.deployment_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-500">Created At</span>
                  <span className="text-sm text-neutral-300">{run.created_at ? new Date(run.created_at).toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-500">Started At</span>
                  <span className="text-sm text-neutral-300">{run.started_at ? new Date(run.started_at).toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Completed At</span>
                  <span className="text-sm text-neutral-300">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Output / Result */}
          <div className="h-full min-h-[300px] flex flex-col">
            <h3 className="mb-2 text-sm font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Output Payload
            </h3>
            <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 p-4 overflow-auto">
              {run.output ? (
                <pre className="text-xs text-neutral-300 font-mono whitespace-pre-wrap">
                  {JSON.stringify(run.output, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600 italic">
                  No output data available yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Props for GenerationDashboard
 */
export interface GenerationDashboardProps {
  /** Supabase client instance (required) */
  supabase: SupabaseClient;
}

/**
 * Admin Generation Dashboard
 *
 * Real-time monitoring of durable workflow runs
 *
 * @example
 * ```tsx
 * import { createClient } from '@/lib/supabase/client';
 *
 * function AdminGenerationPage() {
 *   const supabase = createClient();
 *   return <GenerationDashboard supabase={supabase} />;
 * }
 * ```
 */
export function GenerationDashboard({ supabase }: GenerationDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<WorkflowRunStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  const { runs, stats, isLoading, isConnected, error, refresh, cancelRun } = useWorkflowRuns({
    supabase,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handleCancel = async (runId: string) => {
    setCancellingId(runId);
    await cancelRun(runId);
    setCancellingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">
            AI Generation Monitor
          </h1>
          <p className="text-neutral-400">
            Real-time monitoring of durable workflow runs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-neutral-500/20 text-neutral-400'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Activity}
          color="bg-neutral-800/50 border-neutral-700/50"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        />
        <StatCard
          label="Running"
          value={stats.running}
          icon={PlayCircle}
          color="bg-blue-500/10 border-blue-500/30 text-blue-400"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          color="bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={XCircle}
          color="bg-red-500/10 border-red-500/30 text-red-400"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          icon={Ban}
          color="bg-neutral-500/10 border-neutral-500/30 text-neutral-400"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-neutral-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkflowRunStatus | 'all')}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          <p className="font-medium">Error loading workflow runs</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {/* Runs List */}
      <div className="space-y-2">
        {isLoading && runs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : runs.length === 0 ? (
          <div className="rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-neutral-600" />
            <p className="mt-4 text-neutral-400">No workflow runs found</p>
            <p className="text-sm text-neutral-500">
              Run a durable agent to see it appear here in real-time
            </p>
          </div>
        ) : (
          runs.map((run) => (
            <RunRow
              key={run.run_id}
              run={run}
              onCancel={handleCancel}
              isCancelling={cancellingId === run.run_id}
              onClick={setSelectedRun}
            />
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedRun && (
        <RunDetailsModal run={selectedRun} onClose={() => setSelectedRun(null)} />
      )}
    </div>
  );
}

export default GenerationDashboard;
