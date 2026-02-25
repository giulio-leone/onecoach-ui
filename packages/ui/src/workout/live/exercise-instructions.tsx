'use client';

import { useTranslations } from 'next-intl';
import { FileText, CheckCircle2, Dumbbell } from 'lucide-react';
import { Badge } from '../../badge';
import { Heading, Text } from '../../typography';
import type { Exercise } from '@giulio-leone/schemas';

export interface ExerciseInstructionsProps {
  exercise: Exercise;
  className?: string;
}

export function ExerciseInstructions({ exercise, className = '' }: ExerciseInstructionsProps) {
  const t = useTranslations('workouts');

  const hasVideo = !!exercise.videoUrl;

  return (
    <div className={`animate-fadeIn ${className}`}>
      {/* 
        Grid Layout Logic:
        - If video exists: 2 columns on LG screens (Text Left, Video Right)
        - If NO video: 1 column layout (Text takes full width), giving Form Cues more space to grid themselves
      */}
      <div className={`grid gap-8 ${hasVideo ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Left Column: Context & Text */}
        <div className="space-y-8">
          {/* Description */}
          {exercise.description && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText className="h-4 w-4" />
                <Heading level={4} size="xs" weight="bold" className="tracking-widest uppercase">
                  Descrizione
                </Heading>
              </div>
              <Text size="sm" className="leading-relaxed text-neutral-300">
                {exercise.description}
              </Text>
            </div>
          )}

          {/* Equipment Tags - Styled as Modern Badges */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Dumbbell className="h-4 w-4" />
                <Heading level={4} size="xs" weight="bold" className="tracking-widest uppercase">
                  Attrezzatura
                </Heading>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((eq: string, index: number) => (
                  <Badge
                    key={index}
                    variant="neutral"
                    className="border-neutral-700 bg-neutral-800/50 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Points (Form Cues) */}
          {exercise.formCues && exercise.formCues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle2 className="h-4 w-4" />
                <Heading level={4} size="xs" weight="bold" className="tracking-widest uppercase">
                  {t('exercise_instructions.punti_chiave')}
                </Heading>
              </div>

              {/* 
                 Form Cues Grid Logic:
                 - Default: Stacked (1 col)
                 - If NO Video & Wide Screen: Expand to 2 cols because we have width available 
              */}
              <div className={`grid gap-2 ${!hasVideo ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {exercise.formCues.map((cue: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
                  >
                    <span className="mt-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-neutral-400 transition-colors group-hover:text-neutral-200">
                      {cue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Video Player (Only rendered if video exists) */}
        {hasVideo && (
          <div className="relative h-full min-h-[200px] overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-2xl">
            <div className="group relative h-full w-full">
              <video
                src={exercise.videoUrl}
                controls
                className="h-full w-full object-cover"
                preload="metadata"
                poster="/video-placeholder-dark.jpg"
              />
            </div>

            {/* Decorative Gradient Glow behind video container */}
            <div className="absolute -inset-1 -z-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-20 blur-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
// End of component
