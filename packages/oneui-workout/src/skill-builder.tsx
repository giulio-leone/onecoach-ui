'use client';

import { useTranslations } from 'next-intl';
/**
 * Visual Skill Builder Component
 * Drag-and-drop interface for creating skills
 */

import { useState } from 'react';
import { useSkills } from '@onecoach/lib-visual-builder/hooks';
import type { Skill, SkillFormData } from '@onecoach/lib-visual-builder/types';
import { Plus, Save, Code, Rocket, Trash2 } from 'lucide-react';

interface SkillBuilderProps {
  skillId?: string;
  onSave?: (skill: Skill) => void;
}

export function SkillBuilder({ skillId, onSave }: SkillBuilderProps) {
  const t = useTranslations('common');

  const { createSkill, updateSkill, deploySkill, generateCode, loading, error } = useSkills();

  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    description: '',
    version: '1.0.0',
    category: '',
    tags: [],
    inputSchema: {},
    outputSchema: {},
    implementation: {},
    isPublic: false,
  });

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  const handleSave = async () => {
    try {
      const skill = skillId ? await updateSkill(skillId, formData) : await createSkill(formData);

      if (onSave) onSave(skill);

      // Show success notification
      alert(t('common.skill_builder.skill_saved_successfully'));
    } catch (err: unknown) {
      alert(`Error saving skill: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGenerateCode = async () => {
    if (!skillId) {
      alert(t('common.skill_builder.please_save_the_skill_first_before_gener'));
      return;
    }

    try {
      const result = await generateCode(skillId);
      setGeneratedCode(result.code);
      setShowCodePreview(true);
    } catch (err: unknown) {
      alert(`Error generating code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeploy = async () => {
    if (!skillId) {
      alert(t('common.skill_builder.please_save_the_skill_first_before_deplo'));
      return;
    }

    try {
      await deploySkill(skillId);
      alert(t('common.skill_builder.skill_deployed_successfully'));
    } catch (err: unknown) {
      alert(`Error deploying skill: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const addInputField = () => {
    const fieldName = prompt('Field name:');
    if (!fieldName) return;

    const fieldType = prompt('Field type (string, number, boolean):') || 'string';

    setFormData((prev) => ({
      ...prev,
      inputSchema: {
        ...prev.inputSchema,
        [fieldName]: { type: fieldType },
      },
    }));
  };

  const removeInputField = (fieldName: string) => {
    setFormData((prev) => {
      const newSchema = { ...prev.inputSchema };
      delete newSchema[fieldName];
      return { ...prev, inputSchema: newSchema };
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('common.skill_builder.visual_skill_builder')}</h1>
          <p className="text-muted-foreground">
            {t('common.skill_builder.create_custom_skills_with_drag_and_drop_')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={handleGenerateCode}
            disabled={loading || !skillId}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Code size={16} />
            {t('common.skill_builder.generate_code')}
          </button>
          <button
            onClick={handleDeploy}
            disabled={loading || !skillId}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Rocket size={16} />
            Deploy
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <strong>{t('common.skill_builder.error')}</strong> {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          {t('common.skill_builder.basic_information')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('common.skill_builder.name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={t('common.skill_builder.e_g_email_validator')}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, version: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="1.0.0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
              placeholder={t('common.skill_builder.describe_what_this_skill_does')}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={t('common.skill_builder.e_g_validation_transformation')}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('common.skill_builder.tags_comma_separated')}
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  tags: e.target.value.split(',').map((t) => t.trim()),
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={t('common.skill_builder.email_validation_utility')}
            />
          </div>
        </div>
      </div>

      {/* Input Schema */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('common.skill_builder.input_schema')}</h2>
          <button
            onClick={addInputField}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            {t('common.skill_builder.add_field')}
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(formData.inputSchema).map(([fieldName, fieldConfig]) => (
            <div
              key={fieldName}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex-1">
                <span className="font-medium">{fieldName}</span>
                <span className="ml-2 text-sm text-gray-600">
                  (
                  {typeof fieldConfig === 'object' && fieldConfig !== null && 'type' in fieldConfig
                    ? String(fieldConfig.type)
                    : 'unknown'}
                  )
                </span>
              </div>
              <button
                onClick={() => removeInputField(fieldName)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {Object.keys(formData.inputSchema).length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              {t('common.skill_builder.no_input_fields_defined_click_add_field_')}
            </div>
          )}
        </div>
      </div>

      {/* Implementation */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Implementation</h2>
        <textarea
          value={JSON.stringify(formData.implementation, null, 2)}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            try {
              const impl = JSON.parse(e.target.value);
              setFormData((prev) => ({ ...prev, implementation: impl }));
            } catch (_error: unknown) {
              // Invalid JSON, ignore
            }
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          rows={10}
          placeholder={t('common.skill_builder.blocks_code')}
        />
        <p className="mt-2 text-sm text-gray-600">
          {t('common.skill_builder.define_the_skill_implementation_as_json_')}
        </p>
      </div>

      {/* Code Preview Modal */}
      {showCodePreview && generatedCode && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {t('common.skill_builder.generated_typescript_code')}
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
                  alert(t('common.skill_builder.code_copied_to_clipboard'));
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {t('common.skill_builder.copy_to_clipboard')}
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
