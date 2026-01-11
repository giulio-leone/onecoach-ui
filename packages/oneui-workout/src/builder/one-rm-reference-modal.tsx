import { useState, useRef, useLayoutEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, ModalFooter, Button } from '@onecoach/ui';
import { Save, Search } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import type { Exercise } from '@onecoach/types-workout';

interface OneRmReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedExercises: Exercise[];
  referenceMaxes: Record<string, number>;
  onUpdateMaxes: (maxes: Record<string, number>) => void;
}

export function OneRmReferenceModal({
  isOpen,
  onClose,
  usedExercises,
  referenceMaxes,
  onUpdateMaxes,
}: OneRmReferenceModalProps) {
  const t = useTranslations('workouts.builder.oneRm');
  const [localMaxes, setLocalMaxes] = useState<Record<string, number>>(referenceMaxes);
  const [search, setSearch] = useState('');
  const wasOpenRef = useRef(isOpen);

  // Sync local state with prop when modal opens (transition from closed → open)
  // This is intentional: we need to reset local form state when the modal opens
  useLayoutEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync on modal open
      setLocalMaxes(referenceMaxes);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, referenceMaxes]);

  const handleSave = () => {
    onUpdateMaxes(localMaxes);
    onClose();
  };

  // Filter to unique exercises by catalogExerciseId (not instance id)
  // because 1RM is a property of the exercise TYPE, not the instance in the workout
  const uniqueExercises = usedExercises.filter((ex, index, arr) => {
    if (!ex.catalogExerciseId) return false;
    return arr.findIndex((e) => e.catalogExerciseId === ex.catalogExerciseId) === index;
  });

  const filteredExercises = uniqueExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-neutral-400">{t('description')}</p>

        <div className="group relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-blue-500" />
          <input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className={cn(
              'w-full rounded-xl border bg-neutral-900/50 py-2.5 pr-4 pl-10 text-sm transition-all outline-none',
              'border-neutral-800 focus:border-blue-500/50 focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/10',
              'text-white placeholder:text-neutral-600'
            )}
          />
        </div>

        <div className="scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent max-h-[300px] space-y-2 overflow-y-auto pr-2">
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="rounded-full border border-neutral-800 bg-neutral-900/50 p-3">
                <Search className="h-5 w-5 text-neutral-600" />
              </div>
              <span className="text-sm text-neutral-500">
                {search ? t('noResults') : t('noExercisesInProgram')}
              </span>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.catalogExerciseId}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-3 transition-all',
                  'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60'
                )}
              >
                <span className="mr-4 line-clamp-1 flex-1 text-sm font-medium text-neutral-300">
                  {exercise.name}
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/50 p-1 transition-all focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20">
                  <input
                    type="number"
                    value={localMaxes[exercise.catalogExerciseId] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocalMaxes((prev) => ({
                        ...prev,
                        [exercise.catalogExerciseId]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    className="w-16 bg-transparent px-2 py-0.5 text-right text-sm font-medium text-white outline-none placeholder:text-neutral-700"
                  />
                  <span className="pr-2 text-xs font-medium text-neutral-500">kg</span>
                </div>
              </div>
            ))
          )}
        </div>

        <ModalFooter className="border-t border-neutral-800/50 px-0 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            {t('cancel')}
          </button>
          <Button
            variant="gradient-primary"
            icon={<Save size={16} className="text-white" />}
            onPress={handleSave}
            className="h-9 px-4"
          >
            {t('save')}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
