'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Button, Checkbox } from '@giulio-leone/ui';
import { toast } from 'sonner';
import { Save, X, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

import { logger } from '@giulio-leone/lib-shared';

// Lazy load Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PromptEditorProps {
  prompt: {
    agentId: string;
    name: string;
    description: string | null;
    promptTemplate: string | null;
    defaultPrompt: string;
    variables: Record<string, { type: string; description: string; required: boolean }>;
    isActive: boolean;
  };
  onSave: (template: string, isActive: boolean) => Promise<void>;
  onCancel: () => void;
}

export function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const t = useTranslations('admin');

  const [template, setTemplate] = useState(prompt.promptTemplate || prompt.defaultPrompt);
  const [isActive, setIsActive] = useState(prompt.isActive);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Genera variabili di esempio per preview
  const exampleVariables: Record<string, unknown> = {};
  for (const [varName, varDef] of Object.entries(prompt.variables)) {
    if (varDef.type === 'string') {
      exampleVariables[varName] = `example_${varName}`;
    } else if (varDef.type === 'number') {
      exampleVariables[varName] = 10;
    } else if (varDef.type === 'array') {
      exampleVariables[varName] = ['item1', 'item2'];
    } else if (varDef.type === 'object') {
      exampleVariables[varName] = { key: 'value' };
    }
  }

  async function generatePreview() {
    try {
      const response = await fetch(
        `/api/admin/prompts/${encodeURIComponent(prompt.agentId)}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptTemplate: template,
            variables: exampleVariables,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      setPreview(data.renderedPrompt);
      setShowPreview(true);
    } catch (error) {
      logger.error('Failed to generate preview:', error);
      toast.error(t('prompt_editor.failed_to_generate_preview'));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(template, isActive);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold">
          {t('prompt_editor.edit_prompt')}
          {prompt.name}
        </h2>
        {prompt.description && <p className="text-muted-foreground">{prompt.description}</p>}
        <p className="text-muted-foreground mt-1 font-mono text-xs">{prompt.agentId}</p>
      </div>

      {/* Variables Info */}
      {Object.keys(prompt.variables).length > 0 && (
        <div className="bg-muted mb-4 rounded-lg p-4">
          <h3 className="mb-2 font-semibold">{t('prompt_editor.available_variables')}</h3>
          <div className="space-y-1">
            {Object.entries(prompt.variables).map(([varName, varDef]) => (
              <div key={varName} className="text-sm">
                <code className="bg-background rounded px-1">${`{${varName}}`}</code>
                {' - '}
                <span className="text-muted-foreground">{varDef.description}</span>
                {varDef.required && (
                  <span className="ml-1 text-red-500">{t('prompt_editor.required')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="mb-4 overflow-hidden rounded-lg border">
        <MonacoEditor
          height="500px"
          language="markdown"
          value={template}
          onChange={(value) => setTemplate(value ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center gap-4">
        <Checkbox
          label={t('prompt_editor.enable_custom_prompt_when_disabled_uses_')}
          checked={isActive}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={generatePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background max-h-[80vh] w-full max-w-4xl overflow-auto rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Preview</h3>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <pre className="bg-muted rounded p-4 text-sm whitespace-pre-wrap">{preview}</pre>
          </div>
        </div>
      )}

      {/* Default Prompt Reference */}
      <div className="bg-muted mt-6 rounded-lg p-4">
        <h3 className="mb-2 font-semibold">{t('prompt_editor.default_prompt_reference')}</h3>
        <details>
          <summary className="text-muted-foreground cursor-pointer text-sm">
            {t('prompt_editor.click_to_view_default_prompt')}
          </summary>
          <pre className="bg-background mt-2 max-h-96 overflow-auto rounded p-4 text-xs whitespace-pre-wrap">
            {prompt.defaultPrompt}
          </pre>
        </details>
      </div>
    </div>
  );
}
