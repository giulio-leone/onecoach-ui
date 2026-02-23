/**
 * Admin Menu Mobile Component
 *
 * Wrapper per drawer mobile con trigger
 * Principi: KISS, SOLID (Single Responsibility)
 */

'use client';

import { useState } from 'react';
import { AdminActionsDrawer } from './admin-actions-drawer';
import type { AdminMenuItem } from './admin-menu-item.types';

interface AdminMenuMobileProps {
  trigger: React.ReactNode;
  items: AdminMenuItem[];
  className?: string;
}

export function AdminMenuMobile({ trigger, items, className = '' }: AdminMenuMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <div onClick={() => setIsOpen(true)} className="inline-block">
        {trigger}
      </div>
      <AdminActionsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} items={items} />
    </div>
  );
}
