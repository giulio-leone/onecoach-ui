/**
 * Admin Badge Component - Structural
 *
 * Badge component con varianti per ruoli e status, dark mode ottimizzato
 */

import { cn } from '@giulio-leone/lib-design-system';
import { Shield, User } from 'lucide-react';

export type BadgeVariant =
  | 'role-super-admin'
  | 'role-admin'
  | 'role-coach'
  | 'role-user'
  | 'status-active'
  | 'status-suspended'
  | 'status-deleted';

export interface AdminBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  'role-super-admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'role-admin': 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
  'role-coach': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'role-user': 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  'status-active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'status-suspended': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'status-deleted': 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
};

const defaultIcons: Partial<Record<BadgeVariant, React.ReactNode>> = {
  'role-super-admin': <Shield className="h-3 w-3" />,
  'role-admin': <Shield className="h-3 w-3" />,
  'role-coach': <User className="h-3 w-3" />,
  'role-user': <User className="h-3 w-3" />,
};

export function AdminBadge({ variant, children, icon, className }: AdminBadgeProps) {
  const defaultIcon = defaultIcons[variant];
  const displayIcon = icon !== undefined ? icon : defaultIcon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
        badgeStyles[variant],
        className
      )}
    >
      {displayIcon}
      {children}
    </span>
  );
}

/**
 * Helper functions per badge comuni
 */
export function RoleBadge({ role }: { role: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    SUPER_ADMIN: 'role-super-admin',
    ADMIN: 'role-admin',
    COACH: 'role-coach',
    USER: 'role-user',
  };

  const labelMap: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    COACH: 'Coach',
    USER: 'User',
  };

  const variant = variantMap[role] || 'role-user';
  const label = labelMap[role] || role;

  return <AdminBadge variant={variant}>{label}</AdminBadge>;
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    ACTIVE: 'status-active',
    SUSPENDED: 'status-suspended',
    DELETED: 'status-deleted',
  };

  const variant = variantMap[status] || 'status-active';

  return <AdminBadge variant={variant}>{status}</AdminBadge>;
}
