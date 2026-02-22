'use client';

import { useTranslations } from 'next-intl';
/**
 * Skills List Component
 * Display and manage user's skills
 */

import { useState, useEffect } from 'react';
import { useSkills } from '@giulio-leone/lib-visual-builder/hooks';
import type { Skill } from '@giulio-leone/lib-visual-builder/types';
import { Plus, Edit, Trash2, Code, Rocket, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox, Heading, Text, Button, Badge } from '@giulio-leone/ui';

interface SkillsListProps {
  onEdit?: (skill: Skill) => void;
  onCreate?: () => void;
}

export function SkillsList({ onEdit, onCreate }: SkillsListProps) {
  const t = useTranslations('common');

  const { skills, loading, error, fetchSkills, deleteSkill, deploySkill, generateCode } =
    useSkills();
  const [includePublic, setIncludePublic] = useState(false);

  useEffect(() => {
    fetchSkills(includePublic);
  }, [fetchSkills, includePublic]);

  const handleDelete = async (skillId: string, skillName: string) => {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) return;

    try {
      await deleteSkill(skillId);
      await fetchSkills(includePublic);
      alert(t('common.skills_list.skill_deleted_successfully'));
    } catch (err: unknown) {
      alert(`Error deleting skill: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeploy = async (skillId: string, skillName: string) => {
    try {
      await deploySkill(skillId);
      await fetchSkills(includePublic);
      alert(`Skill "${skillName}" deployed successfully!`);
    } catch (err: unknown) {
      alert(`Error deploying skill: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGenerateCode = async (skillId: string, skillName: string) => {
    try {
      const result = await generateCode(skillId);

      // Download as file
      const blob = new Blob([result.code], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skillName.toLowerCase().replace(/\s+/g, '-')}-skill.ts`;
      a.click();
      URL.revokeObjectURL(url);

      alert(t('common.skills_list.code_generated_and_downloaded'));
    } catch (err: unknown) {
      alert(`Error generating code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading && skills.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Text size="lg" className="text-gray-500">{t('common.skills_list.loading_skills')}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1} size="3xl" weight="bold">{t('common.skills_list.my_skills')}</Heading>
          <Text className="text-muted-foreground">
            {t('common.skills_list.manage_your_custom_skills')}
          </Text>
        </div>
        <Button
          onClick={onCreate}
          className="gap-2"
        >
          <Plus size={16} />
          {t('common.skills_list.create_new_skill')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Checkbox
          label={t('common.skills_list.include_public_skills')}
          checked={includePublic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludePublic(e.target.checked)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <strong>{t('common.skills_list.error')}</strong> {error}
        </div>
      )}

      {/* Skills Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill: any) => (
          <div
            key={skill.id}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <Heading level={3} weight="semibold">{skill.name}</Heading>
                <Text size="sm" className="text-gray-600">v{skill.version}</Text>
              </div>
              {skill.isActive && (
                <Badge variant="success">
                  Active
                </Badge>
              )}
            </div>

            {/* Description */}
            <Text size="sm" className="mb-4 line-clamp-2 text-gray-600">
              {skill.description || 'No description'}
            </Text>

            {/* Metadata */}
            <div className="mb-4 space-y-1 text-xs text-gray-500">
              {skill.category && (
                <div className="flex items-center gap-1">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                    {skill.category}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Updated {formatDistanceToNow(new Date(skill.updatedAt))} ago</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit?.(skill)}
                className="flex-1 gap-1"
              >
                <Edit size={14} />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleGenerateCode(skill.id, skill.name)}
                className="gap-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
                title={t('common.skills_list.generate_code')}
              >
                <Code size={14} />
              </Button>
              {!skill.isActive && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleDeploy(skill.id, skill.name)}
                  className="gap-1"
                  title="Deploy"
                >
                  <Rocket size={14} />
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(skill.id, skill.name)}
                className="gap-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && !loading && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Text size="lg" className="mb-4 text-gray-600">{t('common.skills_list.no_skills_yet')}</Text>
          <Button
            onClick={onCreate}
            className="gap-2"
          >
            <Plus size={16} />
            {t('common.skills_list.create_your_first_skill')}
          </Button>
        </div>
      )}
    </div>
  );
}
