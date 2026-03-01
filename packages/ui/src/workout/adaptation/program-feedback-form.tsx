'use client';

import React, { useState, useCallback } from 'react';
import { Star, Send } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@giulio-leone/ui';
import { Button } from '@giulio-leone/ui';
import { Textarea } from '../../textarea';
import { RadioGroup, RadioGroupOption } from '../../radio-group';

// --- Local types (UI decoupled from backend) ---

export interface ProgramFeedback {
  overallRating: number;
  volumeRating: 'too_low' | 'right' | 'too_high';
  intensityRating: 'too_low' | 'right' | 'too_high';
  difficultyRating: 'too_easy' | 'right' | 'too_hard';
  whatWorked?: string;
  whatDidntWork?: string;
  suggestions?: string;
}

export interface ProgramFeedbackFormProps {
  onSubmit: (feedback: ProgramFeedback) => void;
  programName?: string;
  className?: string;
}

// --- Star Rating ---

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Overall rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="rounded-full p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={cn(
              'transition-colors duration-150',
              (hovered || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-neutral-300 dark:text-neutral-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// --- Main Component ---

export const ProgramFeedbackForm: React.FC<ProgramFeedbackFormProps> = ({
  onSubmit,
  programName,
  className,
}) => {
  const [overallRating, setOverallRating] = useState(0);
  const [volumeRating, setVolumeRating] = useState<ProgramFeedback['volumeRating']>('right');
  const [intensityRating, setIntensityRating] = useState<ProgramFeedback['intensityRating']>('right');
  const [difficultyRating, setDifficultyRating] = useState<ProgramFeedback['difficultyRating']>('right');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidntWork, setWhatDidntWork] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const canSubmit = overallRating > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      onSubmit({
        overallRating,
        volumeRating,
        intensityRating,
        difficultyRating,
        whatWorked: whatWorked.trim() || undefined,
        whatDidntWork: whatDidntWork.trim() || undefined,
        suggestions: suggestions.trim() || undefined,
      });
    },
    [canSubmit, onSubmit, overallRating, volumeRating, intensityRating, difficultyRating, whatWorked, whatDidntWork, suggestions]
  );

  return (
    <Card variant="default" padding="none" className={className}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Program Feedback</CardTitle>
          {programName && (
            <CardDescription>How was your experience with {programName}?</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Overall Rating
            </label>
            <StarRating value={overallRating} onChange={setOverallRating} />
          </div>

          {/* Volume */}
          <RadioGroup
            label="Volume"
            name="volume"
            value={volumeRating}
            onChange={(v) => setVolumeRating(v as ProgramFeedback['volumeRating'])}
            orientation="horizontal"
            spacing="sm"
          >
            <RadioGroupOption value="too_low" label="Too Low" />
            <RadioGroupOption value="right" label="Right" />
            <RadioGroupOption value="too_high" label="Too High" />
          </RadioGroup>

          {/* Intensity */}
          <RadioGroup
            label="Intensity"
            name="intensity"
            value={intensityRating}
            onChange={(v) => setIntensityRating(v as ProgramFeedback['intensityRating'])}
            orientation="horizontal"
            spacing="sm"
          >
            <RadioGroupOption value="too_low" label="Too Low" />
            <RadioGroupOption value="right" label="Right" />
            <RadioGroupOption value="too_high" label="Too High" />
          </RadioGroup>

          {/* Difficulty */}
          <RadioGroup
            label="Difficulty"
            name="difficulty"
            value={difficultyRating}
            onChange={(v) => setDifficultyRating(v as ProgramFeedback['difficultyRating'])}
            orientation="horizontal"
            spacing="sm"
          >
            <RadioGroupOption value="too_easy" label="Too Easy" />
            <RadioGroupOption value="right" label="Right" />
            <RadioGroupOption value="too_hard" label="Too Hard" />
          </RadioGroup>

          {/* Textareas */}
          <Textarea
            label="What worked?"
            placeholder="Exercises, structure, progression..."
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            rows={3}
          />

          <Textarea
            label="What didn't work?"
            placeholder="Anything that felt off or could be improved..."
            value={whatDidntWork}
            onChange={(e) => setWhatDidntWork(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Suggestions"
            placeholder="Ideas for the next cycle..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={3}
          />
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" variant="primary" icon={Send} disabled={!canSubmit}>
            Submit Feedback
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

ProgramFeedbackForm.displayName = 'ProgramFeedbackForm';
