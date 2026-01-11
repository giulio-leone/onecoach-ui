/**
 * Admin Dropdown Menu Component
 *
 * Wrapper responsive: drawer mobile, dropdown desktop
 * Principi: KISS, SOLID, DRY
 */

'use client';

import { cn } from '@onecoach/lib-design-system';
import { AdminMenuMobile } from './admin-menu-mobile';
import { AdminDropdownDesktop } from './admin-dropdown-desktop';
import type { AdminMenuItem } from './admin-menu-item.types';

interface AdminDropdownMenuProps {
  trigger: React.ReactNode;
  items: AdminMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function AdminDropdownMenu({
  trigger,
  items,
  align = 'right',
  className = '',
}: AdminDropdownMenuProps) {
  return (
    <>
      {/* Mobile: Drawer dal basso */}
      <div className={cn('lg:hidden', className)}>
        <AdminMenuMobile trigger={trigger} items={items} />
      </div>

      {/* Desktop: Dropdown classico */}
      <div className={cn('hidden lg:block', className)}>
        <AdminDropdownDesktop trigger={trigger} items={items} align={align} />
      </div>
    </>
  );
}
