'use client';

import { useTranslations } from 'next-intl';
/**
 * Metadata Translation Manager
 *
 * Admin component for managing translations of exercise metadata
 * (types, muscles, body parts, equipment)
 */
import { useEffect, useState } from 'react';
import { Button, Input, LoadingIndicator } from '@giulio-leone/ui';
import { Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
interface Translation {
  locale: string;
  name: string;
  description?: string | null;
}
interface MetadataEntity {
  id: string; // ID del metadata
  name: string; // Nome inglese
  slug?: string;
  localizedName: string;
  translations?: Translation[];
}
interface MetadataState {
  exerciseTypes: MetadataEntity[];
  muscles: MetadataEntity[];
  bodyParts: MetadataEntity[];
  equipment: MetadataEntity[];
}
// Removed unused interface _EditedTranslation
const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italian' },
];
export function MetadataTranslationManager() {
  const t = useTranslations('admin');

  const [metadata, setMetadata] = useState<MetadataState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState('it');
  const [activeTab, setActiveTab] = useState<'types' | 'muscles' | 'bodyParts' | 'equipment'>(
    'types'
  );
  const [editedTranslations, setEditedTranslations] = useState<Record<string, string>>({});
  useEffect(() => {
    loadMetadata();
  }, []);
  const loadMetadata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/metadata?locale=en');
      if (!response.ok) throw new Error('Failed to load metadata');
      const data = await response.json();
      setMetadata(data.data);
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : 'Failed to load metadata');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Send updates to API
      const failedUpdates: Array<{ entityId: string; error: string }> = [];
      for (const [key, name] of Object.entries(editedTranslations)) {
        const [entityType, entityId] = key.split('::');
        if (!entityId) {
          failedUpdates.push({
            entityId: 'unknown',
            error: 'Missing entity ID in key',
          });
          continue;
        }
        try {
          const response = await fetch('/api/admin/metadata/translations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityType: entityType as 'exerciseType' | 'muscle' | 'bodyPart' | 'equipment',
              entityId,
              locale: selectedLocale,
              name,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            let errorMessage = `HTTP ${response.status}`;
            if (errorData?.error) {
              if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              } else {
                const errorStr = String(errorData.error);
                errorMessage = errorStr || 'Unknown error';
              }
            }
            failedUpdates.push({
              entityId,
              error: errorMessage,
            });
          }
        } catch (_err: unknown) {
          failedUpdates.push({
            entityId,
            error: _err instanceof Error ? _err.message || 'Unknown error' : 'Network error',
          });
        }
      }
      // Check for errors
      if (failedUpdates.length > 0) {
        const errorMsg = failedUpdates.map((f: any) => `${f.entityId}: ${f.error}`).join(', ');
        throw new Error(`Failed to save: ${errorMsg}`);
      }
      setSuccess('Translations saved successfully!');
      setEditedTranslations({});
      await loadMetadata();
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : 'Failed to save translations');
    } finally {
      setIsSaving(false);
    }
  };
  const getEntityTypeKey = (): 'exerciseType' | 'muscle' | 'bodyPart' | 'equipment' => {
    switch (activeTab) {
      case 'types':
        return 'exerciseType';
      case 'muscles':
        return 'muscle';
      case 'bodyParts':
        return 'bodyPart';
      case 'equipment':
        return 'equipment';
      default:
        return 'muscle';
    }
  };
  const handleTranslationChange = (entityId: string, value: string) => {
    const key = `${getEntityTypeKey()}::${entityId}`;
    setEditedTranslations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const getTranslationValue = (entity: MetadataEntity): string => {
    const key = `${getEntityTypeKey()}::${entity.id}`;
    if (editedTranslations[key] !== undefined) {
      return editedTranslations[key];
    }
    const translation = entity.translations?.find((t: any) => t.locale === selectedLocale);
    return translation?.name || '';
  };
  const getCurrentEntities = (): MetadataEntity[] => {
    if (!metadata) return [];
    switch (activeTab) {
      case 'types':
        return metadata.exerciseTypes;
      case 'muscles':
        return metadata.muscles;
      case 'bodyParts':
        return metadata.bodyParts;
      case 'equipment':
        return metadata.equipment;
      default:
        return [];
    }
  };
  const getEntityLabel = () => {
    switch (activeTab) {
      case 'types':
        return 'Exercise Types';
      case 'muscles':
        return 'Muscles';
      case 'bodyParts':
        return 'Body Parts';
      case 'equipment':
        return 'Equipment';
      default:
        return '';
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }
  const entities = getCurrentEntities();
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-950">
      <div className="border-b border-neutral-200 p-6 dark:border-white/[0.08]">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t('admin.metadata_translation_manager.metadata_translations')}
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
          {t('admin.metadata_translation_manager.manage_translations_for_exercise_metadat')}
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-white/[0.08]">
        <button
          onClick={() => setActiveTab('types')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'types'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-100 dark:text-neutral-400'
          }`}
        >
          {t('admin.metadata_translation_manager.exercise_types')}
          {metadata?.exerciseTypes.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('muscles')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'muscles'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-100 dark:text-neutral-400'
          }`}
        >
          {t('admin.metadata_translation_manager.muscles')}
          {metadata?.muscles.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('bodyParts')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'bodyParts'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-100 dark:text-neutral-400'
          }`}
        >
          {t('admin.metadata_translation_manager.body_parts')}
          {metadata?.bodyParts.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'equipment'
              ? 'border-b-2 border-emerald-500 text-emerald-600'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-100 dark:text-neutral-400'
          }`}
        >
          {t('admin.metadata_translation_manager.equipment')}
          {metadata?.equipment.length || 0})
        </button>
      </div>
      {/* Locale Selector */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-white/[0.08] dark:bg-neutral-800/50">
        <label className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-500">
          {t('admin.metadata_translation_manager.target_language')}
        </label>
        <select
          value={selectedLocale}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLocale(e.target.value)}
          className="mt-2 w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-white/[0.1]"
        >
          {LOCALES.filter((l: any) => l.code !== 'en').map((locale: any) => (
            <option key={locale.code} value={locale.code}>
              {locale.label}
            </option>
          ))}
        </select>
      </div>
      {/* Translation List */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {getEntityLabel()}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            {t('admin.metadata_translation_manager.english_names_are_shown_on_the_left_add_')}
          </p>
        </div>
        <div className="space-y-4">
          {entities.map((entity: any) => {
            return (
              <div
                key={entity.id}
                className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-white/[0.08] dark:bg-neutral-800/50"
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-500">
                    {t('admin.metadata_translation_manager.english_name')}
                  </label>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-900 dark:bg-zinc-950 dark:text-neutral-100">
                    {entity.name}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-500">
                    {LOCALES.find((l: any) => l.code === selectedLocale)?.label} Translation
                  </label>
                  <Input
                    value={getTranslationValue(entity)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleTranslationChange(entity.id, e.target.value)
                    }
                    placeholder={`Add ${LOCALES.find((l: any) => l.code === selectedLocale)?.label} translation`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Feedback Messages */}
      {(error || success) && (
        <div className="px-6 pb-4">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{error || success}</span>
            </div>
          </div>
        </div>
      )}
      {/* Actions */}
      <div className="border-t border-neutral-200 px-6 py-4 dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            {t('admin.metadata_translation_manager.changes_are_saved_automatically_to_the_d')}
          </p>
          <Button
            icon={Save}
            size="sm"
            onClick={handleSave}
            disabled={isSaving || Object.keys(editedTranslations).length === 0}
            className="ml-auto"
          >
            {isSaving ? 'Saving...' : `Save ${Object.keys(editedTranslations).length} Change(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
