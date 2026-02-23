'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseCard } from './exercise-card';
import type { Exercise } from '@giulio-leone/types/workout';

interface SortableExerciseCardProps {
  exercise: Exercise;
  index: number;
  onUpdate: (exercise: Exercise) => void;
  onRemove: () => void;
  referenceOneRm?: number;
  weightUnit?: 'KG' | 'LBS';
}

export function SortableExerciseCard(props: SortableExerciseCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.exercise.id || `exercise-${props.index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ExerciseCard
        exercise={props.exercise}
        index={props.index}
        onUpdate={props.onUpdate}
        onRemove={props.onRemove}
        referenceOneRm={props.referenceOneRm}
        weightUnit={props.weightUnit}
      />
    </div>
  );
}
