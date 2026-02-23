/**
 * PageHeader Component
 *
 * Componente riutilizzabile per header di pagina
 * Supporta dark mode, responsive layout e azioni multiple
 * Segue SRP, DRY e KISS principles
 */

import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-3 overflow-x-hidden sm:gap-4 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold break-words text-neutral-900 sm:text-2xl lg:text-3xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs break-words text-neutral-600 sm:text-sm dark:text-neutral-200">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:flex-nowrap">{actions}</div>
      )}
    </header>
  );
}
