import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Container, Stack, Heading, Text } from '@giulio-leone/ui';

export type AdminPageProps = {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  maxWidth?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  padding?: 'sm' | 'md' | 'lg';
};

/**
 * AdminPage - wrapper with background and consistent container across admin pages.
 */
export function AdminPage({
  children,
  className,
  gradient = true,
  maxWidth = '7xl',
  padding = 'md',
}: AdminPageProps) {
  return (
    <div className={cn('min-h-screen bg-neutral-50/50 dark:bg-neutral-950', className)}>
      {gradient && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />
          <div className="absolute top-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/5" />
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

export type AdminSectionProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * AdminSection - section with optional title/actions and standard spacing.
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
              <Heading level={3} size="lg" weight="semibold" className="text-neutral-900 dark:text-white">
                {title}
              </Heading>
            )}
            {description && (
              <Text size="sm" className="text-neutral-600 dark:text-neutral-400">
                {description}
              </Text>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export type AdminPageContentProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * AdminPageContent - wrapper for main content blocks (e.g., cards/grids).
 */
export function AdminPageContent({ className, children }: AdminPageContentProps) {
  return <div className={cn('space-y-8', className)}>{children}</div>;
}
