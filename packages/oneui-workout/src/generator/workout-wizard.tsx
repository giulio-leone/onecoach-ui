import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, SelectionCard, WizardLayout } from '@onecoach/ui';
import { cn } from '@onecoach/lib-design-system';
import { Dumbbell, Clock, User, Zap, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

// Types
interface SelectionOption {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface WizardFormData {
  goal: string;
  experience: string;
  daysPerWeek: number;
  durationMinutes: number;
  location: string;
}

// Mock Data for Selection
const GOALS: SelectionOption[] = [
  {
    id: 'strength',
    title: 'Forza',
    description: 'Aumenta la forza massimale',
    icon: <Dumbbell size={24} className="text-blue-600" />,
  },
  {
    id: 'hypertrophy',
    title: 'Ipertrofia',
    description: 'Aumenta la massa muscolare',
    icon: <User size={24} className="text-blue-600" />,
  },
  {
    id: 'endurance',
    title: 'Resistenza',
    description: 'Migliora la resistenza cardiovascolare',
    icon: <Clock size={24} className="text-blue-600" />,
  },
];

const EXPERIENCE_LEVELS: SelectionOption[] = [
  {
    id: 'beginner',
    title: 'Principiante',
    description: '0-1 anni di esperienza',
    icon: <Zap size={24} className="text-green-500" />,
  },
  {
    id: 'intermediate',
    title: 'Intermedio',
    description: '1-3 anni di esperienza',
    icon: <Zap size={24} className="text-yellow-500" />,
  },
  {
    id: 'advanced',
    title: 'Avanzato',
    description: '3+ anni di esperienza',
    icon: <Zap size={24} className="text-red-500" />,
  },
];

// LOCATIONS moved inside component to use translations

export function WorkoutWizard({ onGenerate }: { onGenerate: (data: WizardFormData) => void }) {
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    goal: '',
    experience: '',
    daysPerWeek: 3,
    durationMinutes: 60,
    location: '',
  });

  const updateData = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      id: 'goal',
      title: 'Obiettivo',
      description: 'Qual è il tuo obiettivo principale?',
      isValid: !!formData.goal,
      component: (
        <div className="flex flex-wrap gap-3">
          {GOALS.map((goal) => (
            <SelectionCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              icon={goal.icon}
              selected={formData.goal === goal.id}
              onPress={() => updateData('goal', goal.id)}
              className="w-full sm:basis-[48%]"
              compact
            />
          ))}
        </div>
      ),
    },
    {
      id: 'experience',
      title: 'Esperienza',
      description: 'Qual è il tuo livello di esperienza?',
      isValid: !!formData.experience,
      component: (
        <div className="flex flex-wrap gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <SelectionCard
              key={level.id}
              title={level.title}
              description={level.description}
              icon={level.icon}
              selected={formData.experience === level.id}
              onPress={() => updateData('experience', level.id)}
              className="w-full sm:basis-[48%]"
              compact
            />
          ))}
        </div>
      ),
    },
    {
      id: 'availability',
      title: 'Disponibilità',
      description: 'Quanto tempo puoi dedicare?',
      isValid: formData.daysPerWeek > 0 && formData.durationMinutes > 0,
      component: (
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              Giorni a settimana: {formData.daysPerWeek}
            </p>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((days) => (
                <Button
                  key={days}
                  variant={formData.daysPerWeek === days ? 'primary' : 'outline'}
                  onClick={() => updateData('daysPerWeek', days)}
                  className={cn('flex-1', formData.daysPerWeek !== days && 'opacity-50')}
                >
                  {days.toString()}
                </Button>
              ))}
            </div>
          </div>

          <Input
            label="Durata sessione (minuti)"
            value={formData.durationMinutes.toString()}
            onChange={(e) => updateData('durationMinutes', parseInt(e.target.value) || 0)}
            type="number"
            className="bg-neutral-50 dark:bg-neutral-800/50"
          />
        </div>
      ),
    },
    {
      id: 'location',
      title: 'Luogo',
      description: 'Dove ti allenerai?',
      isValid: !!formData.location,
      component: (
        <div className="flex flex-wrap gap-3">
          {[
            {
              id: 'gym',
              title: 'Palestra',
              description: 'Accesso completo a macchinari e pesi',
              icon: <MapPin size={24} className="text-purple-500" />,
            },
            {
              id: 'home_dumbbells',
              title: 'Casa (Manubri)',
              description: 'Allenamento con manubri e panca',
              icon: <MapPin size={24} className="text-purple-500" />,
            },
            {
              id: 'bodyweight',
              title: 'Corpo Libero',
              description: t('common.ui.noEquipment'),
              icon: <MapPin size={24} className="text-purple-500" />,
            },
          ].map((loc) => (
            <SelectionCard
              key={loc.id}
              title={loc.title}
              description={loc.description}
              icon={loc.icon}
              selected={formData.location === loc.id}
              onPress={() => updateData('location', loc.id)}
              className="w-full sm:basis-[48%]"
              compact
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <WizardLayout
      title="Workout Generator"
      subtitle="Crea il tuo piano d'allenamento"
      steps={steps}
      currentStepIndex={currentStep}
      onStepChange={setCurrentStep}
      onComplete={() => onGenerate(formData)}
    />
  );
}
