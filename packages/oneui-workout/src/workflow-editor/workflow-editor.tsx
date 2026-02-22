/**
 * Visual Workflow Editor Component
 * Flowchart-based interface for creating workflows with React Flow
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, type CustomNodeData } from './custom-nodes';
import { useWorkflows } from '@giulio-leone/lib-visual-builder/hooks';
import type { Workflow, NodeType } from '@giulio-leone/lib-visual-builder/types';
import { Save, Code, Rocket, Plus, Trash2 } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';

interface WorkflowEditorProps {
  workflowId?: string;
  onSave?: (workflow: Workflow) => void;
}

const nodeTypeOptions: Array<{ value: NodeType; label: string }> = [
  { value: 'agent', label: 'Agent' },
  { value: 'skill', label: 'Skill' },
  { value: 'decision', label: 'Decision' },
  { value: 'loop', label: 'Loop' },
  { value: 'condition', label: 'Condition' },
];

export function WorkflowEditor({ workflowId, onSave }: WorkflowEditorProps) {
  const t = useTranslations();
  const {
    fetchWorkflow,
    updateWorkflow,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addEdgeAPI,
    deleteEdge: deleteEdgeAPI,
    deployWorkflow,
    generateCode,
    loading,
    error,
  } = useWorkflows();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [_showNodePanel, _setShowNodePanel] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const nodeCounterRef = useRef(0);

  const loadWorkflow = useCallback(async () => {
    if (!workflowId) return;

    try {
      const wf = await fetchWorkflow(workflowId);
      setWorkflow(wf);

      // Convert database nodes to ReactFlow nodes
      const flowNodes: Node<CustomNodeData>[] = wf.nodes.map((node) => ({
        id: node.id,
        type: 'workflowNode',
        position: node.position as { x: number; y: number },
        data: {
          label: node.label,
          type: node.type as NodeType,
          config: node.config as Record<string, unknown>,
        } as CustomNodeData,
      }));

      // Convert database edges to ReactFlow edges
      const flowEdges: Edge[] = wf.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label || undefined,
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err: unknown) {
      logger.error(t('common.error'), err);
    }
  }, [workflowId, fetchWorkflow, setNodes, setEdges, t]);

  // Load workflow
  useEffect(() => {
    if (!workflowId) {
      return;
    }

    // Use setTimeout to avoid calling setState synchronously in effect
    const timeoutId = setTimeout(() => {
      void loadWorkflow();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [workflowId, loadWorkflow]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!workflowId || !connection.source || !connection.target) return;

      try {
        const edge = await addEdgeAPI(workflowId, {
          sourceId: connection.source,
          targetId: connection.target,
          label: '',
        });

        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: edge.id,
              animated: true,
            },
            eds
          )
        );
      } catch (err: unknown) {
        logger.error(t('common.error'), err);
      }
    },
    [workflowId, addEdgeAPI, setEdges, t]
  );

  const handleAddNode = async (type: NodeType) => {
    if (!workflowId) {
      alert(t('common.workflow_editor.please_save_the_workflow_first'));
      return;
    }

    const label = prompt(`Enter label for ${type} node:`);
    if (!label) return;

    // Generate deterministic position using counter to avoid impure functions
    nodeCounterRef.current += 1;
    const seed = nodeCounterRef.current;
    const randomX = (((seed * 9301 + 49297) % 233280) / 233280) * 400;
    const randomY = (((seed * 9301 + 49297) % 233280) / 233280) * 400;

    try {
      const node = await addNode(workflowId, {
        type,
        label,
        position: { x: randomX, y: randomY },
        config: {},
      });

      setNodes((nds) => [
        ...nds,
        {
          id: node.id,
          type: 'workflowNode',
          position: node.position as { x: number; y: number },
          data: {
            label: node.label,
            type: node.type as NodeType,
            config: node.config as Record<string, unknown>,
          } as CustomNodeData,
        } as Node<CustomNodeData>,
      ]);
    } catch (err: unknown) {
      alert(`Error adding node: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (!workflowId) return;

    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      alert(t('common.workflow_editor.no_nodes_or_edges_selected'));
      return;
    }

    if (!confirm(`Delete ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)?`)) {
      return;
    }

    try {
      // Delete nodes
      for (const node of selectedNodes) {
        await deleteNode(workflowId, node.id);
      }

      // Delete edges
      for (const edge of selectedEdges) {
        await deleteEdgeAPI(workflowId, edge.id);
      }

      // Reload workflow
      await loadWorkflow();
    } catch (err: unknown) {
      alert(`Error deleting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    if (!workflowId || !workflow) return;

    try {
      // Save node positions
      for (const node of nodes) {
        await updateNode(workflowId, node.id, {
          position: node.position,
        });
      }

      await updateWorkflow(workflowId, {
        name: workflow.name,
        description: workflow.description || undefined,
      });

      if (onSave && workflow) onSave(workflow);

      alert(t('common.workflow_editor.workflow_saved_successfully'));
    } catch (err: unknown) {
      alert(`Error saving workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGenerateCode = async () => {
    if (!workflowId) {
      alert(t('common.workflow_editor.please_save_the_workflow_first'));
      return;
    }

    try {
      const result = await generateCode(workflowId);
      setGeneratedCode(result.code);
      setShowCodePreview(true);
    } catch (err: unknown) {
      alert(`Error generating code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeploy = async () => {
    if (!workflowId) {
      alert(t('common.workflow_editor.please_save_the_workflow_first'));
      return;
    }

    try {
      await deployWorkflow(workflowId);
      alert(t('common.workflow_editor.workflow_deployed_successfully'));
    } catch (err: unknown) {
      alert(`Error deploying workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* Top Panel */}
        <Panel position="top-left" className="space-y-2">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h2 className="mb-3 text-lg font-semibold">{workflow?.name || 'Workflow Editor'}</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleGenerateCode}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <Code size={14} />
                Generate
              </button>
              <button
                onClick={handleDeploy}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Rocket size={14} />
                Deploy
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 shadow-lg">{error}</div>
          )}
        </Panel>

        {/* Right Panel - Add Nodes */}
        <Panel position="top-right">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold">{t('common.workflow_editor.add_nodes')}</h3>
            <div className="space-y-2">
              {nodeTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAddNode(option.value)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Plus size={14} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Code Preview Modal */}
      {showCodePreview && generatedCode && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {t('common.workflow_editor.generated_typescript_code')}
              </h3>
              <button
                onClick={() => setShowCodePreview(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
              {generatedCode}
            </pre>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  alert(t('common.workflow_editor.code_copied_to_clipboard'));
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {t('common.workflow_editor.copy_to_clipboard')}
              </button>
              <button
                onClick={() => setShowCodePreview(false)}
                className="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
