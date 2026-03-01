import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Container, Stack } from '../layout-primitives';

type AdminPageProps = {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  maxWidth?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  padding?: 'sm' | 'md' | 'lg';
};

/**
 * AdminPage - wrapper con background e contenitore coerente tra pagine admin.
 */
export function AdminPage({
  children,
  className,
  gradient = true,
  maxWidth = '7xl',
  padding = 'md',
}: AdminPageProps) {
  return (
    <div className={cn('min-h-screen bg-neutral-50/50 dark:bg-[#09090b]', className)}>
      {gradient && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
          <div className="absolute top-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary-500/10 blur-[100px] dark:bg-secondary-500/5" />
        </div>
      )}
      <div className="relative z-10">
        <Container maxWidth={maxWidth} padding={padding}>
          <Stack spacing="xl">{children}</Stack>
        </Container>
      </div>
    </div>
  );
}

type AdminSectionProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * AdminSection - sezione con titolo/azioni opzionali e spaziatura standard.
 */
export function AdminSection({
  title,
  description,
  actions,
  children,
  className,
}: AdminSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * AdminPageContent - wrapper per blocchi principali (e.g., card/griglie).
 */
export function AdminPageContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('space-y-8', className)}>{children}</div>;
}
