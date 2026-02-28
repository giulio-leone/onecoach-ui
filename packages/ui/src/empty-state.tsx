/**
 * EmptyState Component
 *
 * Componente atomico per stati vuoti
 * Segue SRP
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="animate-fadeIn mt-20 text-center text-slate-500">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50">
        <Icon size={40} className="text-slate-400" />
      </div>
      <p className="mb-2 text-xl font-semibold text-slate-700">{title}</p>
      <p className="text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
