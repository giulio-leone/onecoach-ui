'use client';

import { X } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { cn } from '@giulio-leone/lib-design-system';

interface Action {
  id: string;
  label: string;
  icon?: any;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onPress: () => void;
}

interface SelectionActionBarWebProps {
  isVisible: boolean;
  selectedCount: number;
  onClose: () => void;
  actions: Action[];
  className?: string;
}

export function SelectionActionBarWeb({
  isVisible,
  selectedCount,
  onClose,
  actions,
  className,
}: SelectionActionBarWebProps) {
  if (!isVisible) return null;

  return ( // Client-only portal might be needed if generic, but here inline is fine or use Portal from radix
    <div className={cn("fixed bottom-8 left-1/2 z-50 flex w-[90%] max-w-2xl -translate-x-1/2 items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800", className)}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {selectedCount} selezionati
        </span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant === 'danger' ? 'danger' : action.variant === 'secondary' ? 'secondary' : 'primary'}
            size="sm"
            onClick={action.onPress}
            icon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
