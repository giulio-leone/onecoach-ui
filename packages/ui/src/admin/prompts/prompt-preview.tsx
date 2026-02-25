'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '../../button';
import { Play, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@giulio-leone/lib-design-system';

import { logger } from '@giulio-leone/lib-shared';
interface PromptPreviewProps {
  agentId: string;
  template: string;
  variables: Record<string, { type: string; description: string; required: boolean }>;
  className?: string;
}

export function PromptPreview({ agentId, template, variables, className }: PromptPreviewProps) {
  const t = useTranslations('admin');

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate example variables based on schema
  const getExampleVariables = () => {
    const examples: Record<string, unknown> = {};
    for (const [varName, varDef] of Object.entries(variables)) {
      if (varDef.type === 'string') {
        examples[varName] = `[${varName.toUpperCase()}]`;
      } else if (varDef.type === 'number') {
        examples[varName] = 123;
      } else if (varDef.type === 'array') {
        examples[varName] = ['Item 1', 'Item 2', 'Item 3'];
      } else if (varDef.type === 'object') {
        examples[varName] = { key: 'value' };
      }
    }
    return examples;
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/prompts/${encodeURIComponent(agentId)}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTemplate: template,
          variables: getExampleVariables(),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreview(data.renderedPrompt);
    } catch (error) {
      logger.error('Failed to generate preview:', error);
      toast.error(t('admin.prompt_preview.failed_to_generate_preview'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!preview) return;
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t('admin.prompt_preview.copied_to_clipboard'));
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h3 className="font-semibold">Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generatePreview} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-2 h-3.5 w-3.5" />
            )}
            Run
          </Button>
          {preview && (
            <Button variant="ghost" size="icon-sm" iconOnly onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-900/50">
        {preview ? (
          <pre className="font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
            {preview}
          </pre>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Play className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm">{t('admin.prompt_preview.click_run_to_generate_preview')}</p>
            <p className="mt-1 text-xs opacity-70">
              {t('admin.prompt_preview.uses_example_variables')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
