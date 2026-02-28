'use client';

// import { useState } from 'react'; - Removed unused import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@giulio-leone/ui';
import { Button } from '@giulio-leone/ui';
import { Flame, Link2, RefreshCw, Activity, Dumbbell, X } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type WorkoutElementType = 'warmup' | 'exercise' | 'superset' | 'circuit' | 'cardio';

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
    icon: <Flame className="h-6 w-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  },
  {
    type: 'exercise',
    label: 'Esercizio',
    description: 'Esercizio standard con serie e ripetizioni',
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'text-primary-500',
    bgColor: 'bg-primary-500/10 hover:bg-primary-500/20 border-primary-500/30',
  },
  {
    type: 'superset',
    label: 'Superset',
    description: '2-4 esercizi eseguiti back-to-back',
    icon: <Link2 className="h-6 w-6" />,
    color: 'text-secondary-500',
    bgColor: 'bg-secondary-500/10 hover:bg-secondary-500/20 border-secondary-500/30',
  },
  {
    type: 'circuit',
    label: 'Circuito',
    description: 'Esercizi in sequenza per più round',
    icon: <RefreshCw className="h-6 w-6" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    type: 'cardio',
    label: 'Cardio',
    description: 'Attività cardiovascolare (corsa, bici, etc.)',
    icon: <Activity className="h-6 w-6" />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30',
  },
];

// ============================================================================
// ElementTypeSelector Component
// ============================================================================

/**
 * ElementTypeSelector - Modal dialog for choosing workout element type
 *
 * Features:
 * - Visual grid of element types with icons
 * - Hover effects and animations
 * - Responsive layout (2 cols mobile, 3 cols desktop)
 * - Italian labels and descriptions
 */
export function ElementTypeSelector({
  open,
  onOpenChange,
  onSelect,
  className,
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

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                'flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all',
                option.bgColor
              )}
            >
              <div className={cn('mb-2', option.color)}>{option.icon}</div>
              <span className="mb-1 text-sm font-medium">{option.label}</span>
              <span className="text-muted-foreground text-center text-[10px] leading-tight">
                {option.description}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="border-border/50 mt-4 border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            <X className="mr-1 h-4 w-4" />
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ElementTypeSelector;
