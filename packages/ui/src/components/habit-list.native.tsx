'use client';

import { cn } from '@onecoach/lib-design-system';
import { UnifiedListItem } from './unified-list-item';
import type { HabitProps } from './habit-card';

interface HabitListProps {
  habits: HabitProps[];
  onToggleHabit?: (id: string) => void;
  className?: string;
}

export function HabitList({
  habits, onToggleHabit, className }: HabitListProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {habits.map((habit: HabitProps) => (
        <UnifiedListItem
          key={habit.id}
          id={habit.id}
          title={habit.title}
          description={habit.description}
          type="habit"
          status={habit.completedToday ? 'completed' : 'pending'}
          streak={habit.streak}
          onToggle={() => onToggleHabit?.(habit.id)}
          onPress={() => {}}
          className="mb-0 h-full" // Override margin and height
        />
      ))}
    </div>
  );
}
