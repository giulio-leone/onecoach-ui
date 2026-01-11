'use client';

import { useTranslations } from 'next-intl';
/**
 * ExerciseDetailDrawer
 *
 * Drawer responsive con i dettagli completi dell'esercizio selezionato.
 * - Mobile: Bottom sheet con drag handle e animazione slide-up
 * - Desktop: Side drawer con animazione slide-in-right
 *
 * Segue i principi KISS, SOLID, DRY.
 * Pattern coerente con FoodDetailDrawer per UX uniforme.
 */
import type { LocalizedExercise } from '@onecoach/lib-exercise';
import { ExerciseApprovalStatus } from '@onecoach/types/client';
import { Button, Drawer, LoadingIndicator } from '@onecoach/ui';
import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Trash2,
  Edit3,
  PlayCircle,
  Camera,
} from 'lucide-react';
import { STATUS_BADGE_STYLES, STATUS_LABELS } from './exercise-constants';
interface ExerciseDetailDrawerProps {
  isOpen: boolean;
  exercise: LocalizedExercise | null;
  isLoading?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onApprove: (status: ExerciseApprovalStatus) => void;
  onDelete: () => void;
}
export function ExerciseDetailDrawer({
  isOpen,
  exercise,
  isLoading = false,
  onClose,
  onEdit,
  onApprove,
  onDelete,
}: ExerciseDetailDrawerProps) {
  const t = useTranslations('admin');

  if (!exercise) return null;
  const displayName = exercise.translation?.name || exercise.slug;
  const renderContent = () => (
    <>
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingIndicator />
        </div>
      ) : (
        <>
          <div className="space-y-4 sm:space-y-6">
            {/* Azioni */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<ShieldCheck />}
                onClick={() => onApprove(ExerciseApprovalStatus.APPROVED)}
                className="min-h-[44px] flex-1 touch-manipulation sm:flex-initial"
              >
                Approva
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<ShieldX />}
                onClick={() => onApprove(ExerciseApprovalStatus.REJECTED)}
                className="min-h-[44px] flex-1 touch-manipulation sm:flex-initial"
              >
                Rifiuta
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit3 />}
                onClick={onEdit}
                className="min-h-[44px] flex-1 touch-manipulation sm:flex-initial"
              >
                Modifica
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 />}
                onClick={onDelete}
                className="min-h-[44px] flex-1 touch-manipulation sm:flex-initial"
              >
                Elimina
              </Button>
            </div>
            {/* Overview */}
            {exercise.overview && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
                  Overview
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {exercise.overview}
                </p>
              </section>
            )}
            {/* Multimedia */}
            {(exercise.videoUrl || exercise.imageUrl) && (
              <section className="grid gap-3 sm:grid-cols-2">
                {exercise.videoUrl && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                      <PlayCircle className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
                      Video
                    </div>
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200 sm:text-sm"
                    >
                      {t('admin.exercise_detail_drawer.guarda_il_video')}
                    </a>
                  </div>
                )}
                {exercise.imageUrl && (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                      <Camera className="h-3.5 w-3.5 text-purple-500 sm:h-4 sm:w-4" />
                      Immagine
                    </div>
                    <a
                      href={exercise.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-600 transition-colors hover:bg-purple-100 active:bg-purple-200 sm:text-sm"
                    >
                      {t('admin.exercise_detail_drawer.apri_immagine')}
                    </a>
                  </div>
                )}
              </section>
            )}
            {/* Muscoli e body parts */}
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  Muscoli
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {exercise.muscles
                    .map((muscle) => ({
                      slug: (muscle as { slug?: string }).slug ?? '',
                      name: (muscle as { name?: string }).name ?? 'Muscolo',
                      role: ((muscle as { role?: string }).role ?? '').toLowerCase(),
                    }))
                    .map((muscle) => (
                      <span
                        key={`${exercise.id}-${muscle.slug}-${muscle.role}`}
                        className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"
                      >
                        {muscle.name}
                        {muscle.role ? ` · ${muscle.role}` : ''}
                      </span>
                    ))}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  {t('admin.exercise_detail_drawer.parti_del_corpo')}
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {exercise.bodyParts.map((bodyPart) => {
                    const slug = (bodyPart as { slug?: string }).slug ?? 'part';
                    const name = (bodyPart as { name?: string }).name ?? 'Body part';
                    return (
                      <span
                        key={`${exercise.id}-${slug}`}
                        className="rounded-full bg-blue-50 px-2 py-1 text-blue-600"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
            {/* Equipments */}
            <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                Attrezzature
              </h4>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                {(exercise.equipments.length
                  ? exercise.equipments
                  : [{ name: 'Bodyweight', slug: 'bodyweight' }]
                ).map((equipment) => {
                  const slug = (equipment as { slug?: string }).slug ?? 'equipment';
                  const name = (equipment as { name?: string }).name ?? 'Equipment';
                  return (
                    <span
                      key={`${exercise.id}-${slug}`}
                      className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </section>
            {/* Keywords */}
            {exercise.keywords.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {exercise.keywords.map((keyword: string) => (
                    <span
                      key={`${exercise.id}-${keyword}`}
                      className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {/* Instructions */}
            {exercise.instructions.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  <ClipboardList className="h-3.5 w-3.5 text-indigo-500 sm:h-4 sm:w-4" />
                  Istruzioni
                </h4>
                <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-700 dark:text-neutral-300">
                  {exercise.instructions.map((instruction: string, index: number) => (
                    <li key={`${exercise.id}-instruction-${index}`}>{instruction}</li>
                  ))}
                </ol>
              </section>
            )}
            {/* Tips */}
            {exercise.exerciseTips.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
                  {t('admin.exercise_detail_drawer.cue_consigli')}
                </h4>
                <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {exercise.exerciseTips.map((tip: string, index: number) => (
                    <li key={`${exercise.id}-tip-${index}`} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {/* Variations */}
            {exercise.variations.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  Varianti
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {exercise.variations.map((variation: string, index: number) => (
                    <span
                      key={`${exercise.id}-variation-${index}`}
                      className="rounded-lg bg-purple-50 px-2 py-1 text-purple-600"
                    >
                      {variation}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {/* Relazioni */}
            {exercise.related.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h4 className="mb-2 text-xs font-semibold text-neutral-500 uppercase sm:text-sm dark:text-neutral-500">
                  Relazioni
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  {exercise.related.map((relation) => {
                    const relationId = (relation as { id?: string }).id ?? 'relation';
                    const relationType = (relation as { relation?: string }).relation ?? 'related';
                    const relationSlug = (relation as { slug?: string }).slug ?? '';
                    return (
                      <span
                        key={`${exercise.id}-${relationId}-${relationType}`}
                        className="rounded-lg bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
                      >
                        {relationType.toLowerCase()} {relationSlug ? `· ${relationSlug}` : ''}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </>
  );
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{displayName}</span>
          <span
            className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_STYLES[exercise.approvalStatus as ExerciseApprovalStatus]}`}
          >
            {STATUS_LABELS[exercise.approvalStatus as ExerciseApprovalStatus]}
          </span>
        </div>
      }
      position="right"
      size="lg"
      mobileFullScreen
    >
      <p className="mb-4 text-xs text-neutral-500 sm:text-sm dark:text-neutral-500">
        {t('admin.exercise_detail_drawer.slug')}
        {exercise.slug}
      </p>
      {renderContent()}
    </Drawer>
  );
}
