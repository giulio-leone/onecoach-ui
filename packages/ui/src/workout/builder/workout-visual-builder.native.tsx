'use client';

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
// import { Pressable, XPlatButton, XPlatInput } from '../../../../components/ui';
// Mock components for now as they are app-level
const XPlatButton = (props: React.ComponentProps<typeof View>) => <View {...props} />;
const XPlatInput = (props: React.ComponentProps<typeof View>) => <View {...props} />;
const Pressable = (props: React.ComponentProps<typeof View>) => <View {...props} />;

import { useRouter } from 'expo-router'; // Fix import
import { Card } from '../../card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react-native';
import { DifficultyLevel, WorkoutStatus } from '@prisma/client';
import { DayEditor } from './day-editor';

import { logger } from '@giulio-leone/lib-shared';
import type { WorkoutProgram, WorkoutDay, WorkoutWeek } from '@giulio-leone/types/workout';

interface WorkoutVisualBuilderProps {
  initialProgram?: WorkoutProgram;
  onSave?: (program: WorkoutProgram) => Promise<{ success?: boolean } | void>;
}

const createEmptyProgram = (): WorkoutProgram => ({
  id: '',
  name: 'Nuovo Programma',
  description: '',
  difficulty: DifficultyLevel.INTERMEDIATE,
  durationWeeks: 4,
  weeks: [
    {
      weekNumber: 1,
      days: [
        {
          dayNumber: 1,
          name: 'Giorno 1',
          dayName: 'Giorno 1',
          exercises: [],
          notes: '',
          targetMuscles: [],
          cooldown: '',
        },
      ],
      notes: '',
      focus: '',
    },
  ],
  goals: [],
  status: WorkoutStatus.DRAFT,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function WorkoutVisualBuilder({ initialProgram, onSave }: WorkoutVisualBuilderProps) {
  const router = useRouter();
  const [program, setProgram] = useState<WorkoutProgram>(initialProgram || createEmptyProgram());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const currentWeek = program.weeks?.[selectedWeekIndex];
  const currentDay = currentWeek?.days?.[selectedDayIndex];

  const updateProgram = (updates: Partial<WorkoutProgram>) => {
    setProgram((prev) => ({ ...prev, ...updates }));
  };

  const updateDay = (updatedDay: WorkoutDay) => {
    if (!program.weeks?.[selectedWeekIndex]?.days) return;
    const newWeeks = [...(program.weeks || [])];
    const currentWeek = newWeeks[selectedWeekIndex];
    if (!currentWeek) return;

    const newWeek: WorkoutWeek = {
      ...currentWeek,
      days: [...currentWeek.days],
    };
    newWeek.days[selectedDayIndex] = updatedDay;

    newWeeks[selectedWeekIndex] = newWeek;
    setProgram((prev) => ({ ...prev, weeks: newWeeks }));
  };

  const addWeek = () => {
    const newWeekNumber = (program.weeks?.length || 0) + 1;
    const newWeek: WorkoutWeek = {
      weekNumber: newWeekNumber,
      days: [
        {
          dayNumber: 1,
          name: 'Giorno 1',
          dayName: 'Giorno 1',
          exercises: [],
          notes: '',
          targetMuscles: [],
          cooldown: '',
        },
      ],
      notes: '',
      focus: '',
    };
    setProgram((prev) => ({ ...prev, weeks: [...(prev.weeks || []), newWeek] }));
    setSelectedWeekIndex(program.weeks?.length || 0);
    setSelectedDayIndex(0);
  };

  const addDay = () => {
    if (!program.weeks?.[selectedWeekIndex]) return;
    const newWeeks = [...(program.weeks || [])];
    const currentWeek = newWeeks[selectedWeekIndex];
    if (!currentWeek) return;

    const newWeek: WorkoutWeek = {
      ...currentWeek,
      days: [...currentWeek.days],
    };

    const newDayNumber = newWeek.days.length + 1;

    newWeek.days.push({
      dayNumber: newDayNumber,
      name: `Giorno ${newDayNumber}`,
      dayName: `Giorno ${newDayNumber}`,
      exercises: [],
      notes: '',
      targetMuscles: [],
      cooldown: '',
    });

    newWeeks[selectedWeekIndex] = newWeek;

    setProgram((prev) => ({ ...prev, weeks: newWeeks }));
    setSelectedDayIndex(newWeek.days.length - 1);
  };

  const removeDay = (weekIndex: number, dayIndex: number) => {
    if (!program.weeks?.[weekIndex]?.days) return;
    const newWeeks = [...(program.weeks || [])];
    const currentWeek = newWeeks[weekIndex];
    if (!currentWeek) return;

    const newWeek: WorkoutWeek = {
      ...currentWeek,
      days: [...currentWeek.days],
    };

    newWeek.days.splice(dayIndex, 1);

    // Re-index days
    newWeek.days.forEach((day, idx) => {
      day.dayNumber = idx + 1;
      if (day.name.startsWith('Giorno ')) {
        day.name = `Giorno ${idx + 1}`;
      }
    });

    newWeeks[weekIndex] = newWeek;

    setProgram((prev) => ({ ...prev, weeks: newWeeks }));
    if (selectedDayIndex >= newWeek.days.length) {
      setSelectedDayIndex(Math.max(0, newWeek.days.length - 1));
    }
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        const result = await onSave(program);
        if (result && typeof result === 'object' && 'success' in result ? result.success : true) {
          router.push('/workouts');
        }
      } catch (error) {
        logger.error('Error saving program:', error);
      }
    } else {
      logger.warn('Saving program:', program);
      router.push('/workouts');
    }
  };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <Card variant="glass" className="z-10 rounded-none border-x-0 border-t-0 px-4 py-4 pb-6">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
            <ArrowLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
            <Text className="font-medium text-neutral-600 dark:text-neutral-400">Indietro</Text>
          </Pressable>

          <XPlatButton
            variant="gradient-primary"
            label="Salva Programma"
            icon={<Save size={18} className="text-white" />}
            onPress={handleSave}
            className="h-10 px-4"
          />
        </View>

        <View className="gap-4">
          <XPlatInput
            value={program.name}
            onChangeText={(text: string) => updateProgram({ name: text })}
            placeholder="Nome Programma"
            className="border-0 bg-transparent p-0 text-2xl font-bold"
          />

          {/* Week Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {program.weeks?.map((week, index) => (
              <Pressable
                key={week.weekNumber}
                onPress={() => {
                  setSelectedWeekIndex(index);
                  setSelectedDayIndex(0);
                }}
                className={`mr-2 rounded-full px-4 py-2 ${
                  selectedWeekIndex === index ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              >
                <Text
                  className={`${
                    selectedWeekIndex === index
                      ? 'text-white'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Settimana {week.weekNumber}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={addWeek}
              className="items-center justify-center rounded-full bg-neutral-200 px-4 py-2 dark:bg-neutral-800"
            >
              <Plus size={16} className="text-neutral-700 dark:text-neutral-300" />
            </Pressable>
          </ScrollView>
          <XPlatInput
            value={program.description || ''}
            onChangeText={(text: string) => updateProgram({ description: text })}
            placeholder="Descrizione (opzionale)"
            className="h-auto border-0 bg-transparent p-0 text-base text-neutral-600 placeholder:text-neutral-400 dark:text-neutral-400"
          />
        </View>

        {/* Week/Day Selector */}
        <View className="mt-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {currentWeek?.days?.map((day, index) => (
              <Pressable
                key={day.dayNumber}
                onPress={() => setSelectedDayIndex(index)}
                className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                  selectedDayIndex === index
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                } `}
              >
                <Text
                  className={`font-medium ${selectedDayIndex === index ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}
                >
                  {day.name}
                </Text>
                {(currentWeek?.days?.length || 0) > 1 && selectedDayIndex === index && (
                  <Pressable onPress={() => removeDay(selectedWeekIndex, index)}>
                    <Trash2 size={14} className="text-white/70" />
                  </Pressable>
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={addDay}
              className="flex-row items-center gap-2 rounded-full border border-dashed border-neutral-300 bg-transparent px-4 py-2 dark:border-neutral-600"
            >
              <Plus size={16} className="text-neutral-500 dark:text-neutral-400" />
              <Text className="font-medium text-neutral-500 dark:text-neutral-400">
                Aggiungi Giorno
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Card>

      {/* Main Content - Day Editor */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {currentDay ? (
          <DayEditor day={currentDay} onUpdate={updateDay} />
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-neutral-500 dark:text-neutral-400">
              Seleziona o crea un giorno per iniziare
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
