/**
 * ExerciseActionsMenu Component
 *
 * Menu azioni responsive per esercizi.
 * Mobile: dropdown menu, Desktop: bottoni inline.
 * Rifattorizzato: usa AdminDropdownMenu, posizionamento intelligente
 */

'use client';

import { Button } from '@giulio-leone/ui';
import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { AdminDropdownMenu } from '../shared/admin-dropdown-menu';
import type { AdminMenuItem } from '../shared/admin-menu-item.types';
import { cn } from '@giulio-leone/lib-design-system';

export interface ExerciseAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
}

interface ExerciseActionsMenuProps {
  actions: ExerciseAction[];
  className?: string;
}

/**
 * Componente per menu azioni responsive
 * Rifattorizzato: usa AdminDropdownMenu per posizionamento intelligente
 */
export function ExerciseActionsMenu({ actions, className = '' }: ExerciseActionsMenuProps) {
  const dropdownItems: AdminMenuItem[] = actions.map((action: ExerciseAction) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    variant: action.variant === 'danger' ? 'danger' : 'default',
    onClick: action.onClick,
    disabled: action.disabled,
  }));

  const trigger = (
    <button
      className={cn(
        'rounded-lg border p-2 transition-colors',
        'min-h-[2.75rem] min-w-[2.75rem] touch-manipulation',
        'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
        'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]'
      )}
      aria-label="Azioni"
    >
      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );

  // Mobile: dropdown menu con posizionamento intelligente
  const mobileMenu = (
    <div className="lg:hidden">
      <AdminDropdownMenu trigger={trigger} items={dropdownItems} align="right" />
    </div>
  );

  // Desktop: bottoni inline
  const desktopMenu = (
    <div className="hidden items-center gap-2 lg:flex">
      {actions.map((action: ExerciseAction) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            size="sm"
            icon={Icon}
            iconPosition="left"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      {mobileMenu}
      {desktopMenu}
    </div>
  );
}
