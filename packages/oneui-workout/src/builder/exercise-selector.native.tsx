'use client';

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, ActivityIndicator, TextInput } from 'react-native';
// Mock components/actions for decoupling
const Pressable = (props: React.ComponentProps<typeof View> & { onPress?: () => void }) => (
  <View {...props} />
);
const getExercises = async (_query: string) => {
  console.warn('getExercises is not implemented in native UI package');
  return [] as Exercise[];
};

import { Card } from '@giulio-leone/ui';
import { Search, X, Dumbbell, Plus } from 'lucide-react-native';
// import { getExercises } from '@/app/actions/workouts';
import { useTranslations } from 'next-intl';

import { logger } from '@giulio-leone/lib-shared';
import type { Exercise } from '@giulio-leone/types/workout';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseSelector({ isOpen, onClose, onSelect }: ExerciseSelectorProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const data = await getExercises(searchQuery);
        setExercises((data ?? []) as Exercise[]);
      } catch (error) {
        logger.error('Failed to fetch exercises', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen]);

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle
      ? ex.muscleGroups?.includes(selectedMuscle as import('@giulio-leone/types').MuscleGroup)
      : true;
    return matchesMuscle;
  });

  const handleSelect = (ex: Partial<Exercise>) => {
    const newExercise: Exercise = {
      id: Math.random().toString(), // Temp ID for the instance
      catalogExerciseId: ex.id || '',
      name: ex.name!,
      description: '',
      category: ex.category!,
      muscleGroups: ex.muscleGroups || [],
      setGroups: [
        {
          id: Math.random().toString(),
          count: 3,
          baseSet: {
            reps: 10,
            weight: 0,
            weightLbs: 0,
            rest: 60,
            intensityPercent: 0,
            rpe: 8,
          },
          sets: [],
        },
      ],
      notes: '',
      typeLabel: '',
      repRange: '',
      formCues: [],
      equipment: ex.equipment || [],
    };
    onSelect(newExercise);
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50 sm:justify-center">
        <Card
          variant="glass"
          className="h-[90%] w-full overflow-hidden rounded-t-3xl bg-white p-0 sm:h-[80%] sm:w-[600px] sm:self-center sm:rounded-3xl dark:bg-neutral-900"
        >
          {/* Header */}
          <View className="border-b border-neutral-200 p-4 dark:border-neutral-700">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Seleziona Esercizio
              </Text>
              <Pressable onPress={onClose}>
                <X size={24} className="text-neutral-500" />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-2 rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
              <Search size={20} className="ml-2 text-neutral-500" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cerca esercizio..."
                placeholderTextColor="#A3A3A3"
                className="h-10 flex-1 bg-transparent px-2 text-neutral-900 dark:text-white"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 gap-2">
              {['chest', 'back', 'legs', 'shoulders', 'arms', 'core'].map((muscle) => (
                <Pressable
                  key={muscle}
                  onPress={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
                  className={`rounded-full border px-3 py-1 ${
                    selectedMuscle === muscle
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-neutral-300 bg-transparent dark:border-neutral-600'
                  }`}
                >
                  <Text
                    className={`text-sm capitalize ${
                      selectedMuscle === muscle
                        ? 'text-white'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {muscle}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* List */}
          <View className="flex-1">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : (
              <ScrollView className="flex-1 p-4">
                <View className="gap-3 pb-10">
                  {filteredExercises.map((ex) => (
                    <Pressable
                      key={ex.id}
                      onPress={() => handleSelect(ex)}
                      className="flex-row items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <Dumbbell size={24} className="text-blue-600 dark:text-blue-400" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-neutral-900 dark:text-neutral-100">
                          {ex.name}
                        </Text>
                        <Text className="text-sm text-neutral-500 capitalize dark:text-neutral-400">
                          {ex.muscleGroups?.join(', ')}
                        </Text>
                      </View>
                      <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                    </Pressable>
                  ))}
                  {filteredExercises.length === 0 && (
                    <View className="items-center py-10">
                      <Text className="text-neutral-500 dark:text-neutral-400">
                        {t('common.empty.noExercisesFound')}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
}
