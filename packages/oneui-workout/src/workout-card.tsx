/**
 * Workout Card Component
 *
 * Thin wrapper around ProgramCard for workout-specific configuration.
 * Follows DRY principle by using shared ProgramCard abstraction.
 */

'use client';

import { Dumbbell, Calendar, Target, Eye, Edit, Trash2, Send, Copy } from 'lucide-react';
import { ProgramCard, type ProgramCardAction } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';
import type { WorkoutProgram } from '@giulio-leone/types/workout';

interface WorkoutCardProps {
  program: WorkoutProgram;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDeploy?: (id: string, name: string) => void;
  onToggleSelect?: (id: string) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  className?: string;
}

export function WorkoutCard({
  program,
  onDelete,
  onDuplicate,
  onDeploy,
  onToggleSelect,
  isSelected = false,
  selectionMode = false,
  className,
}: WorkoutCardProps) {
  const t = useTranslations('workouts.card');
  const tCommon = useTranslations('common');

  // Build actions array
  const actions: ProgramCardAction[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      title: t('actions.view'),
      colorOnHover: 'blue',
    },
  ];

  if (onDeploy) {
    actions.push({
      icon: <Send className="h-3.5 w-3.5" />,
      title: t('actions.deploy'),
      colorOnHover: 'emerald',
      onClick: () => onDeploy(program.id, program.name),
    });
  }

  actions.push({
    icon: <Edit className="h-3.5 w-3.5" />,
    title: tCommon('edit'),
    colorOnHover: 'blue',
    href: `/workouts/${program.id}/edit`,
  });

  if (onDuplicate) {
    actions.push({
      icon: <Copy className="h-3.5 w-3.5" />,
      title: tCommon('duplicate'),
      colorOnHover: 'blue',
      onClick: () => onDuplicate(program.id),
    });
  }

  if (onDelete) {
    actions.push({
      icon: <Trash2 className="h-3.5 w-3.5" />,
      title: tCommon('delete'),
      colorOnHover: 'rose',
      onClick: () => onDelete(program.id),
    });
  }

  return (
    <ProgramCard
      id={program.id}
      name={program.name}
      description={program.description}
      href={`/workout/${program.id}`}
      badge={t(`difficulty.${program.difficulty}`) || program.difficulty}
      icon={<Dumbbell className="h-6 w-6" />}
      colorTheme="blue"
      stats={[
        {
          icon: <Calendar className="h-3.5 w-3.5" />,
          label: t('stats.duration'),
          value: `${program.durationWeeks} ${t('stats.weeks')}`,
        },
        {
          icon: <Target className="h-3.5 w-3.5" />,
          label: t('stats.goals'),
          value: String(program.goals.length),
        },
      ]}
      actions={actions}
      isSelected={isSelected}
      selectionMode={selectionMode}
      onToggleSelect={onToggleSelect}
      className={className}
    />
  );
}
