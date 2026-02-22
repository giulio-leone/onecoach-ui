'use client';

import { useTranslations } from 'next-intl';
/**
 * Workflows List Component
 * Display and manage user's workflows
 */

import { useState, useEffect } from 'react';
import { useWorkflows } from '@giulio-leone/lib-visual-builder/hooks';
import type { Workflow } from '@giulio-leone/lib-visual-builder/types';
import { Plus, Edit, Trash2, Code, Rocket, Calendar, Network } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@giulio-leone/ui';

interface WorkflowsListProps {
  onEdit?: (workflow: Workflow) => void;
  onCreate?: () => void;
}

export function WorkflowsList({ onEdit, onCreate }: WorkflowsListProps) {
  const t = useTranslations('common');

  const {
    workflows,
    loading,
    error,
    fetchWorkflows,
    deleteWorkflow,
    deployWorkflow,
    generateCode,
  } = useWorkflows();
  const [includePublic, setIncludePublic] = useState(false);

  useEffect(() => {
    fetchWorkflows(includePublic);
  }, [fetchWorkflows, includePublic]);

  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"?`)) return;

    try {
      await deleteWorkflow(workflowId);
      await fetchWorkflows(includePublic);
      alert(t('common.workflows_list.workflow_deleted_successfully'));
    } catch (err: unknown) {
      alert(`Error deleting workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeploy = async (workflowId: string, workflowName: string) => {
    try {
      await deployWorkflow(workflowId);
      await fetchWorkflows(includePublic);
      alert(`Workflow "${workflowName}" deployed successfully!`);
    } catch (err: unknown) {
      alert(`Error deploying workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGenerateCode = async (workflowId: string, workflowName: string) => {
    try {
      const result = await generateCode(workflowId);

      // Download as file
      const blob = new Blob([result.code], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}-workflow.ts`;
      a.click();
      URL.revokeObjectURL(url);

      alert(t('common.workflows_list.code_generated_and_downloaded'));
    } catch (err: unknown) {
      alert(`Error generating code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">{t('common.workflows_list.loading_workflows')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('common.workflows_list.my_workflows')}</h1>
          <p className="text-muted-foreground">
            {t('common.workflows_list.manage_your_custom_workflows')}
          </p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          {t('common.workflows_list.create_new_workflow')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Checkbox
          label={t('common.workflows_list.include_public_workflows')}
          checked={includePublic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludePublic(e.target.checked)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <strong>{t('common.workflows_list.error')}</strong> {error}
        </div>
      )}

      {/* Workflows Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{workflow.name}</h3>
                <p className="text-sm text-gray-600">v{workflow.version}</p>
              </div>
              {workflow.isActive && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Active
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">
              {workflow.description || 'No description'}
            </p>

            {/* Metadata */}
            <div className="mb-4 space-y-1 text-xs text-gray-500">
              {workflow.domain && (
                <div className="flex items-center gap-1">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                    {workflow.domain}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Network size={12} />
                <span>
                  {workflow.nodes?.length || 0} {t('common.workflows_list.nodes')}
                  {workflow.edges?.length || 0} edges
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Updated {formatDistanceToNow(new Date(workflow.updatedAt))} ago</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(workflow)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => handleGenerateCode(workflow.id, workflow.name)}
                className="flex items-center justify-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
                title={t('common.workflows_list.generate_code')}
              >
                <Code size={14} />
              </button>
              {!workflow.isActive && (
                <button
                  onClick={() => handleDeploy(workflow.id, workflow.name)}
                  className="flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                  title="Deploy"
                >
                  <Rocket size={14} />
                </button>
              )}
              <button
                onClick={() => handleDelete(workflow.id, workflow.name)}
                className="flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && !loading && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="mb-4 text-lg text-gray-600">
            {t('common.workflows_list.no_workflows_yet')}
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            {t('common.workflows_list.create_your_first_workflow')}
          </button>
        </div>
      )}
    </div>
  );
}
