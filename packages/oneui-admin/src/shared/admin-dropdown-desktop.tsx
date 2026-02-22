/**
 * Admin Dropdown Desktop Component
 *
 * Dropdown classico per desktop con posizionamento intelligente
 * Principi: KISS, SOLID (Single Responsibility)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { AdminMenuItem } from './admin-menu-item.types';


interface AdminDropdownDesktopProps {
  trigger: React.ReactNode;
  items: AdminMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function AdminDropdownDesktop({
  trigger,
  items,
  align = 'right',
  className = '',
}: AdminDropdownDesktopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{
    horizontal: 'left' | 'right';
    vertical: 'top' | 'bottom';
  }>({ horizontal: align, vertical: 'bottom' });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calcola posizione intelligente per evitare tagli
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) {
      return;
    }

    const calculatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const dropdownRect = dropdownRef.current?.getBoundingClientRect();
      if (!triggerRect || !dropdownRect) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = dropdownRect.width || 192;
      const menuHeight = dropdownRect.height || 200;
      const padding = 8;

      // Calcola posizione orizzontale
      const spaceRight = viewportWidth - triggerRect.right;
      const spaceLeft = triggerRect.left;
      const minSpace = menuWidth + padding;

      let horizontal: 'left' | 'right';
      if (align === 'right') {
        horizontal =
          spaceRight >= minSpace
            ? 'right'
            : spaceLeft >= minSpace
              ? 'left'
              : spaceRight > spaceLeft
                ? 'right'
                : 'left';
      } else {
        horizontal =
          spaceLeft >= minSpace
            ? 'left'
            : spaceRight >= minSpace
              ? 'right'
              : spaceLeft > spaceRight
                ? 'left'
                : 'right';
      }

      // Calcola posizione verticale
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      const vertical: 'top' | 'bottom' =
        spaceBelow >= menuHeight + padding
          ? 'bottom'
          : spaceAbove >= menuHeight + padding
            ? 'top'
            : spaceBelow > spaceAbove
              ? 'bottom'
              : 'top';

      setPosition({ horizontal, vertical });
    };

    calculatePosition();

    const resizeObserver = new ResizeObserver(calculatePosition);
    if (dropdownRef.current) {
      resizeObserver.observe(dropdownRef.current);
    }

    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, align]);

  // Chiudi menu su click esterno
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="inline-block">
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-48 rounded-lg border shadow-lg',
            darkModeClasses.card.elevated,
            darkModeClasses.border.base,
            position.horizontal === 'right' ? 'right-0' : 'left-0',
            position.vertical === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          )}
        >
          <div className="py-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2 text-sm',
                    'min-h-[2.75rem] touch-manipulation transition-colors',
                    item.disabled
                      ? 'cursor-not-allowed opacity-50'
                      : item.variant === 'danger'
                        ? cn(
                            'text-red-600 dark:text-red-400',
                            'hover:bg-red-50 dark:hover:bg-red-900/30'
                          )
                        : cn(darkModeClasses.text.secondary, darkModeClasses.interactive.hover)
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
