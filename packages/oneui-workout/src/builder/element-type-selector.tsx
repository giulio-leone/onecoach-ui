'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@onecoach/ui';
import { Button } from '@onecoach/ui';
import { Flame, Link2, RefreshCw, Activity, Dumbbell, X } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { motion } from 'framer-motion';
import type { WorkoutElementType } from '@onecoach/schemas';

// ============================================================================
// Types
// ============================================================================

interface ElementOption {
  type: WorkoutElementType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface ElementTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: WorkoutElementType) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ELEMENT_OPTIONS: ElementOption[] = [
  {
    type: 'warmup',
    label: 'Riscaldamento',
    description: 'Preparazione muscolare con esercizi leggeri',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  },
  {
    type: 'exercise',
    label: 'Esercizio',
    description: 'Esercizio standard con serie e ripetizioni',
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
  {
    type: 'superset',
    label: 'Superset',
    description: '2-4 esercizi eseguiti back-to-back',
    icon: <Link2 className="w-6 h-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  {
    type: 'circuit',
    label: 'Circuito',
    description: 'Esercizi in sequenza per più round',
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    type: 'cardio',
    label: 'Cardio',
    description: 'Attività cardiovascolare (corsa, bici, etc.)',
    icon: <Activity className="w-6 h-6" />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30',
  },
];

// ============================================================================
// ElementTypeSelector Component
// ============================================================================

export function ElementTypeSelector({ 
  open, 
  onOpenChange, 
  onSelect,
  className 
}: ElementTypeSelectorProps) {
  const handleSelect = (type: WorkoutElementType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle className="text-xl">Aggiungi Elemento</DialogTitle>
          <DialogDescription>
            Scegli il tipo di elemento da aggiungere al tuo allenamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {ELEMENT_OPTIONS.map((option, index) => (
            <motion.button
              key={option.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.type)}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all',
                option.bgColor
              )}
            >
              <div className={cn('mb-2', option.color)}>
                {option.icon}
              </div>
              <span className="font-medium text-sm mb-1">{option.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {option.description}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            <X className="w-4 h-4 mr-1" />
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ElementTypeSelector;

