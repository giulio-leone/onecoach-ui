'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Button, Checkbox } from '@giulio-leone/ui';
import { Save, RotateCcw, Columns, Monitor, Sparkles } from 'lucide-react';
import type { SystemPrompt } from './use-prompts-manager';
import { PromptPreview } from './prompt-preview';
import { cn } from '@giulio-leone/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';

import { logger } from '@giulio-leone/lib-shared';
// Lazy load Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PromptEditorWorkspaceProps {
  prompt: SystemPrompt | null;
  onSave: (template: string, isActive: boolean) => Promise<void>;
  className?: string;
}

export function PromptEditorWorkspace({ prompt, onSave, className }: PromptEditorWorkspaceProps) {
  const t = useTranslations('admin.aiSettings.prompts');
  const tAdmin = useTranslations('admin');
  // All hooks must be called before any conditional returns - rules of hooks
  const [template, setTemplate] = useState(prompt?.promptTemplate || prompt?.defaultPrompt || '');
  const [isActive, setIsActive] = useState(prompt?.isActive ?? false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  // Reset state when prompt changes
  useEffect(() => {
    if (prompt) {
      setTemplate(prompt.promptTemplate || prompt.defaultPrompt);
      setIsActive(prompt.isActive);
    }
  }, [prompt]);

  // Early return AFTER all hooks
  if (!prompt) return null;

  const handleEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;

    // Register completion item provider
    monaco.languages.registerCompletionItemProvider('markdown', {
      provideCompletionItems: (
        model: monacoEditor.editor.ITextModel,
        position: monacoEditor.Position
      ) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = Object.keys(prompt.variables || {}).map((v: string) => ({
          label: `{${v}}`,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: `{${v}}`,
          detail: prompt.variables?.[v]?.description,
          range: range,
        }));

        return { suggestions: suggestions };
      },
    });
  };

  const insertVariable = (variableName: string) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const position = editor.getPosition();
    if (!position) return;
    const text = `{${variableName}}`;

    editor.executeEdits('insert-variable', [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  };

  const enhancePrompt = async () => {
    if (!template) return;
    setEnhancing(true);
    try {
      const response = await fetch('/api/admin/prompts/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: template }),
      });

      if (!response.ok) throw new Error('Failed to enhance prompt');

      const data = await response.json();
      setTemplate(data.enhancedPrompt);
    } catch (error) {
      logger.error('Error enhancing prompt:', error);
      alert(tAdmin('enhanceError'));
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(template, isActive);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(tAdmin('resetConfirm'));
    if (confirmed) {
      setTemplate(prompt.defaultPrompt);
    }
  };

  return (
    <div
      className={cn('flex h-full flex-col overflow-hidden bg-white dark:bg-[#09090b]', className)}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{prompt.name}</h2>
            <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-500 dark:bg-white/[0.04]">
              {prompt.agentId}
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          <Checkbox
            label={tAdmin('customActive')}
            checked={isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
            className={cn(
              'gap-2',
              isActive ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={enhancePrompt}
            disabled={enhancing || !template}
            className="border-secondary-200 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-800 dark:border-secondary-900 dark:bg-secondary-900/20 dark:text-secondary-300 dark:hover:bg-secondary-900/40"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {enhancing ? tAdmin('enhancing') : tAdmin('enhance')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title={tAdmin('preview')}
          >
            {showPreview ? <Monitor className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleReset} title={tAdmin('reset')}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="mr-2 h-4 w-4" />
            {saving ? tAdmin('saving') : tAdmin('save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div
          className={cn(
            'flex flex-col transition-all duration-300',
            showPreview ? 'w-1/2 border-r border-neutral-200 dark:border-neutral-800' : 'w-full'
          )}
        >
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language="markdown"
              value={template}
              onChange={(value: any) => setTemplate(value ?? '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Variables Helper */}
          <div className="border-t border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-white/[0.08] dark:bg-zinc-950">
            <span className="mr-2 font-semibold">{t('variables')}</span>
            {Object.keys(prompt.variables || {}).map((v: string) => (
              <button
                key={v}
                onClick={() => insertVariable(v)}
                className="mr-2 mb-1 inline-block cursor-pointer rounded bg-neutral-200 px-1 py-0.5 text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
                title={prompt.variables?.[v]?.description}
              >
                {`{${v}}`}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <AnimatePresence mode="wait">
          {showPreview && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '50%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900/50"
            >
              <PromptPreview
                agentId={prompt.agentId}
                template={template}
                variables={prompt.variables}
                className="h-full rounded-none border-0 bg-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
