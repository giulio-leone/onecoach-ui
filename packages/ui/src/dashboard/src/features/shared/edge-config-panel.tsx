'use client';

/**
 * Edge Config Panel Component
 *
 * Componente per visualizzare e aggiornare i valori di Vercel Edge Config
 */
import { useState, useEffect } from 'react';
import { Button, Input, Label } from '@giulio-leone/ui';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EdgeConfigPanel() {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const t = useTranslations('admin.edgeConfig');
  const tCommon = useTranslations('common');

  // Carica i valori iniziali
  useEffect(() => {
    loadValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadValues is stable, runs once on mount
  }, []);

  const loadValues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/edge-config');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.loadError'));
      }

      setValues(data.values || {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tCommon('errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: unknown) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/edge-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.saveError'));
      }

      setSuccess(t('messages.saveSuccess', { key }));
      setEditingKey(null);
      await loadValues();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tCommon('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim()) {
      setError(t('messages.keyRequired'));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prova a parsare il valore come JSON, altrimenti usa come stringa
      let parsedValue: unknown = newValue;
      try {
        parsedValue = JSON.parse(newValue);
      } catch (_error: unknown) {
        // Se non è JSON valido, usa come stringa
        parsedValue = newValue;
      }

      const response = await fetch('/api/admin/edge-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newKey.trim(),
          value: parsedValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.addError'));
      }

      setSuccess(t('messages.addSuccess', { key: newKey }));
      setNewKey('');
      setNewValue('');
      await loadValues();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tCommon('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(t('deleteConfirm', { key }));

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/edge-config?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.deleteError'));
      }

      setSuccess(t('messages.deleteSuccess', { key }));
      await loadValues();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tCommon('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (key: string, currentValue: unknown) => {
    setEditingKey(key);
    setEditingValue(
      typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)
    );
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return `(${t('messages.empty')})`;
    }
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value, null, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
        <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
          {tCommon('loading')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t('title')}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t('description')}</p>
        </div>
        <Button onClick={loadValues} variant="outline" size="sm" disabled={loading || saving}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('reload')}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Add New Key */}
      <div className="rounded-lg border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
        <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {t('addNew')}
        </h4>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <div>
            <Label htmlFor="new-key">{t('keyLabel')}</Label>
            <Input
              id="new-key"
              value={newKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey(e.target.value)}
              placeholder={t('keyPlaceholder')}
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="new-value">{t('valueLabel')}</Label>
            <Input
              id="new-value"
              value={newValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
              placeholder={t('valuePlaceholder')}
              disabled={saving}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={saving || !newKey.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('add')}
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Values */}
      <div className="rounded-lg border border-neutral-200/60 bg-white dark:border-white/[0.08] dark:bg-white/[0.04]">
        <div className="border-b border-neutral-200/60 p-4 dark:border-white/[0.08]">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {t('existingValues')} ({Object.keys(values).length})
          </h4>
        </div>
        {Object.keys(values).length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t('noValues')}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-white/[0.08]">
            {Object.entries(values).map(([key, value]) => (
              <div key={key} className="p-4">
                {editingKey === key ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-${key}`}>{t('valueLabel')}</Label>
                      <textarea
                        id={`edit-${key}`}
                        value={editingValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditingValue(e.target.value)
                        }
                        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-zinc-950"
                        rows={4}
                        disabled={saving}
                      />
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {t('jsonHint')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          let parsedValue: unknown = editingValue;
                          try {
                            parsedValue = JSON.parse(editingValue);
                          } catch (_error: unknown) {
                            parsedValue = editingValue;
                          }
                          handleSave(key, parsedValue);
                        }}
                        disabled={saving}
                        size="sm"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {t('save')}
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm" disabled={saving}>
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {key}
                      </div>
                      <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        <pre className="break-words whitespace-pre-wrap">{formatValue(value)}</pre>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(key, value)}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        onClick={() => handleDelete(key)}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <h4 className="mb-2 text-sm font-semibold text-primary-900 dark:text-primary-300">
          {t('infoTitle')}
        </h4>
        <ul className="space-y-1 text-xs text-primary-800 sm:text-sm dark:text-primary-200">
          <li>{t('infoPoints.realtime')}</li>
          <li>{t('infoPoints.types')}</li>
          <li>{t('infoPoints.delete')}</li>
          <li>{t('infoPoints.envVars')}</li>
        </ul>
      </div>
    </div>
  );
}
