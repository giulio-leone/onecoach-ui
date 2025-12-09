/**
 * TabButton Component - Web
 *
 * Componente atomico per tab navigation
 * Segue SRP
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { Button } from './button';
import type { TabButtonSharedProps } from './tab-button.shared';

export interface TabButtonProps extends TabButtonSharedProps {
  icon: LucideIcon | React.ReactElement;
}

export const TabButton = ({ active, onClick, icon: Icon, label, count }: TabButtonProps) => {
  const safeIcon =
    typeof Icon === 'function'
      ? Icon
      : React.isValidElement(Icon)
        ? Icon
        : undefined;

  return (
    <Button
      variant={active ? 'primary' : 'ghost'}
      size="md"
      icon={safeIcon as LucideIcon | React.ReactElement | undefined}
      onClick={onClick}
      className={active ? 'scale-105 shadow-lg' : ''}
    >
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          }`}
        >
          {count}
        </span>
      )}
    </Button>
  );
};
