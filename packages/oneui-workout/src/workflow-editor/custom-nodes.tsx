'use client';

import { useTranslations } from 'next-intl';
/**
 * Custom Node Components for React Flow
 */

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { NodeType } from '@onecoach/lib-visual-builder/types';
import { Bot, Zap, GitBranch, Repeat, AlertCircle } from 'lucide-react';

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  config?: Record<string, unknown>;
}

const nodeTypeConfig: Record<NodeType, { icon: typeof Bot; color: string; bgColor: string }> = {
  agent: {
    icon: Bot,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-300',
  },
  skill: {
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-300',
  },
  decision: {
    icon: GitBranch,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-300',
  },
  loop: {
    icon: Repeat,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-300',
  },
  condition: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-300',
  },
};

export function WorkflowNode(props: NodeProps<Node<CustomNodeData>>) {
  const t = useTranslations('common');

  const { data, selected } = props;
  const config = nodeTypeConfig[data.type];
  const Icon = config.icon;

  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 p-3 shadow-md transition-all ${
        config.bgColor
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-gray-400" />

      <div className="flex items-center gap-2">
        <Icon className={`${config.color}`} size={20} />
        <div className="flex-1">
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-xs text-gray-600 capitalize">{data.type}</div>
        </div>
      </div>

      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="text-xs text-gray-500">
            {Object.entries(data.config).length} {t('common.custom_nodes.config_item_s')}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-gray-400" />
    </div>
  );
}

// Export node types for ReactFlow
export const nodeTypes = {
  workflowNode: WorkflowNode,
};
