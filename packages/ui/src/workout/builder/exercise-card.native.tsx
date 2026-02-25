'use client';

import React, { useState } from 'react';
import { View, Text } from 'react-native';
// Mock components for app-level compatibility
const Pressable = (props: React.ComponentProps<typeof View>) => <View {...props} />;

import { Card } from '../../card';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react-native';
import { cn } from '@giulio-leone/lib-design-system';
import { SetGroupEditor } from '../editor/set-group-editor';
import type { Exercise, SetGroup } from '@giulio-leone/types/workout';

// Helper to sanitise BuilderSetGroup to Domain SetGroup
const toDomainSetGroup = (group: Partial<SetGroup> & Pick<SetGroup, 'baseSet'>): SetGroup => {
  const sanitizeSet = (s: Partial<SetGroup['baseSet']>) => ({
    ...s,
    weight: s.weight ?? null,
    rest: s.rest ?? 90,
    intensityPercent: s.intensityPercent ?? null,
    rpe: s.rpe ?? null,
  });

  return {
    ...group,
    baseSet: sanitizeSet(group.baseSet),
    sets: group.sets?.map(sanitizeSet) || [],
  } as SetGroup;
};

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  onUpdate: (exercise: Exercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  referenceOneRm?: number;
  weightUnit?: 'KG' | 'LBS';
}

export function ExerciseCard({
  exercise,
  index,
  totalExercises,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  referenceOneRm,
  weightUnit = 'KG',
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSetGroupsChange = (newSetGroups: SetGroup[]) => {
    onUpdate({ ...exercise, setGroups: newSetGroups });
  };

  return (
    <Card variant="glass" className="overflow-hidden p-0">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex-row items-center gap-3"
        >
          <View className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Text className="font-bold text-blue-600 dark:text-blue-400">{index + 1}</Text>
          </View>
          <View>
            <Text className="font-bold text-neutral-900 dark:text-neutral-100">
              {exercise.name}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {exercise.muscleGroups?.join(', ')}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={onMoveUp}
            disabled={index === 0}
            className={cn(
              'rounded-lg p-2',
              index === 0 ? 'opacity-40' : 'opacity-100',
              'active:opacity-70'
            )}
            accessibilityLabel="Sposta esercizio in alto"
            accessibilityState={{ disabled: index === 0 }}
          >
            <ArrowUp
              size={16}
              className={cn(
                index === 0
                  ? 'text-neutral-400 dark:text-neutral-600'
                  : 'text-blue-700 dark:text-blue-300'
              )}
            />
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={index === totalExercises - 1}
            className={cn(
              'rounded-lg p-2',
              index === totalExercises - 1 ? 'opacity-40' : 'opacity-100',
              'active:opacity-70'
            )}
            accessibilityLabel="Sposta esercizio in basso"
            accessibilityState={{ disabled: index === totalExercises - 1 }}
          >
            <ArrowDown
              size={16}
              className={cn(
                index === totalExercises - 1
                  ? 'text-neutral-400 dark:text-neutral-600'
                  : 'text-blue-700 dark:text-blue-300'
              )}
            />
          </Pressable>
          <Pressable
            onPress={onRemove}
            className="rounded-lg p-2 active:opacity-70"
            accessibilityLabel="Rimuovi esercizio"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isExpanded && (
        <View className="space-y-4 p-4">
          {exercise.setGroups?.map((group, groupIndex) => (
            <SetGroupEditor
              key={group.id || groupIndex}
              group={group}
              onGroupChange={(updatedGroup) => {
                const newGroups = [...(exercise.setGroups || [])];
                newGroups[groupIndex] = toDomainSetGroup(updatedGroup);
                handleSetGroupsChange(newGroups);
              }}
              onGroupDelete={() => {
                const newGroups = [...(exercise.setGroups || [])];
                newGroups.splice(groupIndex, 1);
                handleSetGroupsChange(newGroups);
              }}
              onGroupDuplicate={() => {
                const newGroups = [...(exercise.setGroups || [])];
                const duplicate: SetGroup = { ...group, id: Math.random().toString() }; // Temp ID
                newGroups.splice(groupIndex + 1, 0, duplicate);
                handleSetGroupsChange(newGroups);
              }}
              oneRepMax={referenceOneRm}
              weightUnit={weightUnit}
            />
          ))}

          <Pressable
            onPress={() => {
              const newGroup: SetGroup = {
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
              };
              handleSetGroupsChange([...(exercise.setGroups || []), newGroup]);
            }}
            className="flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-3 dark:border-neutral-600"
          >
            <Text className="font-medium text-neutral-600 dark:text-neutral-400">
              + Aggiungi Gruppo Serie
            </Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}
