/**
 * Admin Menu Item Types
 *
 * Tipi condivisi per menu dropdown e drawer
 * Principi: DRY, Single Source of Truth
 */

import type { LucideIcon } from 'lucide-react';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}
