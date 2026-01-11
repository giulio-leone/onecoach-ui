'use client';

import { useState } from 'react';
import { View, Text } from 'react-native';
import { Pressable } from '../../../../components/ui';
import { Button } from '@onecoach/ui';
import { Plus, Dumbbell } from 'lucide-react-native';
import { ExerciseCard } from './exercise-card';
import { ExerciseSelector } from './exercise-selector';
import { useTranslations } from 'next-intl';
import type { WorkoutDay, Exercise } from '@onecoach/types-workout';

interface DayEditorProps {
  day: WorkoutDay;
  onUpdate: (day: WorkoutDay) => void;
}

export function DayEditor({ day, onUpdate }: DayEditorProps) {
  const t = useTranslations();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    const newExercises = [...(day.exercises || []), exercise];
    onUpdate({ ...day, exercises: newExercises });
    setIsSelectorOpen(false);
  };

  const handleUpdateExercise = (index: number, updatedExercise: Exercise) => {
    const newExercises = [...(day.exercises || [])];
    newExercises[index] = updatedExercise;
    onUpdate({ ...day, exercises: newExercises });
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...(day.exercises || [])];
    newExercises.splice(index, 1);
    onUpdate({ ...day, exercises: newExercises });
  };

  const handleReorderExercise = (fromIndex: number, toIndex: number) => {
    const newExercises = [...(day.exercises || [])];
    const [moved] = newExercises.splice(fromIndex, 1);
    if (moved) {
      newExercises.splice(toIndex, 0, moved);
      onUpdate({ ...day, exercises: newExercises });
    }
  };

  return (
    <View className="gap-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {day.name}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {day.exercises?.length || 0} Esercizi · {day.totalDuration || 0} min stimati
          </Text>
        </View>
        <Button
          variant="gradient-primary"
          label="Aggiungi Esercizio"
          icon={<Plus size={16} className="text-white" />}
          onPress={() => setIsSelectorOpen(true)}
          className="h-8 px-3"
        />
      </View>

      <View className="gap-4">
        {day.exercises?.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id || index}
            exercise={exercise}
            index={index}
            totalExercises={day.exercises?.length || 0}
            onUpdate={(updated: Exercise) => handleUpdateExercise(index, updated)}
            onRemove={() => handleRemoveExercise(index)}
            onMoveUp={() => index > 0 && handleReorderExercise(index, index - 1)}
            onMoveDown={() =>
              index < (day.exercises?.length || 0) - 1 && handleReorderExercise(index, index + 1)
            }
          />
        ))}

        {(!day.exercises || day.exercises.length === 0) && (
          <Pressable
            onPress={() => setIsSelectorOpen(true)}
            className="items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-12 dark:border-neutral-700 dark:bg-neutral-800/30"
          >
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Dumbbell size={24} className="text-blue-600 dark:text-blue-400" />
            </View>
            <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
              {t('common.empty.noExercises')}
            </Text>
            <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Tocca per aggiungere il primo esercizio
            </Text>
          </Pressable>
        )}
      </View>

      <ExerciseSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddExercise}
      />
    </View>
  );
}
