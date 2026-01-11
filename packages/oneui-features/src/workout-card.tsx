'use client';

import { useTranslations } from 'next-intl';
/**
 * WorkoutCard Component
 *
 * Componente per visualizzare workout program card
 * Segue SRP
 */

import { Dumbbell, Eye, Trash2, Target, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@onecoach/ui';
import type { WorkoutProgram, WorkoutDay } from '@onecoach/types-workout';

export interface WorkoutCardProps {
  program: WorkoutProgram;
  onView: () => void;
  onDelete: () => void;
}

export const WorkoutCard = ({ program, onView, onDelete }: WorkoutCardProps) => {
  const t = useTranslations('common');

  return (
    <Card variant="hover">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2">
              <Dumbbell size={18} className="text-white" />
            </div>
            {program.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
              <Target size={14} className="text-emerald-600" />
              <span>{program.goals?.[0] || 'Fitness'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
              <Calendar size={14} className="text-blue-600" />
              <span>{program.durationWeeks} settimane</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
              <TrendingUp size={14} className="text-amber-600" />
              <span>{program.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
              <Clock size={14} className="text-orange-600" />
              <span>
                {program.weeks[0]?.days.length || 0} {t('common.workout_card.gg_sett')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-md transition-all duration-200 hover:scale-110 hover:from-emerald-400 hover:to-teal-500"
          >
            <Eye size={18} className="text-white" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-2 shadow-md transition-all duration-200 hover:scale-110 hover:from-red-400 hover:to-red-500"
          >
            <Trash2 size={18} className="text-white" />
          </button>
        </div>
      </div>

      {program.weeks && program.weeks[0] && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            {t('common.workout_card.anteprima_settimana_1')}
          </p>
          <div className="space-y-1">
            {program.weeks[0].days.slice(0, 2).map((day: WorkoutDay, idx: number) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50 p-2 text-sm text-slate-700"
              >
                <span className="font-semibold text-emerald-700">Giorno {day.dayNumber}:</span>{' '}
                {day.name}
              </div>
            ))}
            {program.weeks[0].days.length > 2 && (
              <p className="mt-2 text-xs text-slate-500">
                +{program.weeks[0].days.length - 2} {t('common.workout_card.altri_giorni')}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
