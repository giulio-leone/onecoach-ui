'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '../../../card';
import { Badge } from '../../../badge';
import { Button } from '../../../button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Image } from '../../../image';

export interface ResourceAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface ResourceCardProps {
  title: string;
  subtitle?: string;
  imageSrc?: string | null;
  status?: 'active' | 'draft' | 'archived' | string;
  badges?: string[];
  stats?: Array<{ label: string; value: string | number }>;
  actions?: ResourceAction[];
  onClick?: () => void;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  // Selezione multipla per bulk operations
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ResourceCard = ({
  title,
  subtitle,
  imageSrc,
  status,
  badges = [],
  stats = [],
  actions = [],
  onClick,
  href,
  className,
  children,
  isSelected,
  onSelect,
}: ResourceCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.();
  };

  const CardContent = (
    <Card
      variant="glass"
      className={cn(
        'group hover:shadow-primary/5 relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl',
        isSelected && 'ring-2 ring-primary-500 dark:ring-primary-400',
        className
      )}
      onClick={href ? undefined : handleClick}
    >
      {/* Checkbox per selezione multipla */}
      {onSelect && (
        <div
          className="absolute top-3 right-3 z-10"
          onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={handleSelectChange}
            className="h-5 w-5 cursor-pointer rounded border-2 border-neutral-300 bg-white text-primary-600 transition-colors focus:ring-2 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:checked:border-primary-500 dark:checked:bg-primary-500"
          />
        </div>
      )}

      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-white/[0.04]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            width={400}
            height={225}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
            <div className="h-12 w-12 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50" />
          </div>
        )}

        {/* Status Badge Overlay */}
        {status && (
          <div className="absolute top-3 left-3">
            <Badge
              variant={status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'default'}
              className="backdrop-blur-md"
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay (Visible on Hover) */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          {actions.slice(0, 3).map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="secondary"
              className="h-9 w-9 rounded-full p-0"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                action.onClick();
              }}
              title={action.label}
            >
              {action.icon || <MoreHorizontal size={16} />}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="group-hover:text-primary line-clamp-1 text-lg font-bold text-neutral-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Badges / Tags */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 3).map((badge: string) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-300"
              >
                {badge}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500 dark:bg-white/[0.04]">
                +{badges.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            {stats.map((stat: { label: string; value: string | number }) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-[10px] tracking-wider text-neutral-400 uppercase">
                  {stat.label}
                </span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {href ? (
        <Link href={href} className="block h-full" onClick={handleClick}>
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </motion.div>
  );
};
