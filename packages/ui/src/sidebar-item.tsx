'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SidebarItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: string;
  onClick?: () => void;
  depth?: number;
}

export function SidebarItem({
  name,
  href,
  icon: Icon,
  isActive,
  isCollapsed,
  badge,
  onClick,
  depth = 0,
}: SidebarItemProps) {
  const indentation = isCollapsed ? undefined : 12 + depth * 12;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={name}
      className={cn(
        'group relative flex items-center gap-3 overflow-visible rounded-xl py-2.5 pr-3 transition-all duration-200',
        'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
        isActive
          ? 'bg-primary-50/80 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
          : 'text-neutral-600 dark:text-neutral-400',
        isCollapsed && 'justify-center px-2'
      )}
      style={indentation ? { paddingLeft: indentation } : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="activeSidebarItem"
          className="absolute inset-0 rounded-xl bg-primary-50/80 dark:bg-primary-500/10"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-3">
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            isActive
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300'
          )}
        />
        {!isCollapsed && <span className="font-medium tracking-tight">{name}</span>}
      </div>

      {!isCollapsed && badge && (
        <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden translate-x-1 -translate-y-1/2 rounded-md bg-neutral-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg shadow-neutral-900/40 transition-all duration-150 group-hover:block group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:block group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:bg-neutral-800">
          {name}
        </div>
      )}
    </Link>
  );
}
