/**
 * ProgramsPageLayout Component
 *
 * Shared layout for workout and nutrition programs pages.
 * Follows DRY principle - single source for page structure.
 * Uses slot pattern for domain-specific content injection.
 */

'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { Plus, Sparkles, ArrowRight, Upload } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from './card';

/* =============================================================================
   Types
============================================================================= */

export interface FeatureCardProps {
  icon: ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
}

export interface TipItem {
  text: string;
}

export interface ProgramsPageLayoutProps {
  /** Color theme for the page */
  colorTheme: 'blue' | 'emerald';

  /** Header configuration */
  header: {
    icon: ReactNode;
    title: string;
    subtitle: string;
  };

  /** AI Generator CTA configuration */
  generatorCta: {
    title: string;
    description: string;
    generateLink: string;
  };

  /** Saved programs section */
  savedPrograms: {
    icon: ReactNode;
    title: string;
    content: ReactNode;
  };

  /** Sidebar feature cards */
  featureCards: FeatureCardProps[];

  /** Sidebar tips */
  tips: TipItem[];

  /** Optional extra content after saved programs (e.g., tools section) */
  extraContent?: ReactNode;

  /** Modal/overlay content */
  modals?: ReactNode;

  /** Action button handlers */
  onImportClick: () => void;

  /** Create manually link */
  createLink: string;

  /** Import button label */
  /** Import button label */
  importLabel?: string;
  /** Localized labels */
  labels?: ProgramsPageLabels;
}

export interface ProgramsPageLabels {
  startGeneration: string;
  createManually: string;
  createManuallyShort: string;
  importShort: string;
  didYouKnow: string;
}

/* =============================================================================
   Theme Configuration
============================================================================= */

const themeConfig = {
  blue: {
    headerIconGradient: 'from-primary-500 to-indigo-600',
    headerIconShadow: 'shadow-primary-500/20',
    ctaGradient: 'from-primary-600 to-indigo-700 dark:from-primary-700 dark:to-indigo-800',
    ctaTextMuted: 'text-primary-100',
    ctaButtonText: 'text-primary-600',
    ctaButtonHover: 'hover:bg-primary-50',
    importButtonStyle: cn(
      'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-primary-300 hover:bg-emerald-100',
      'dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
    ),
    tipDot: 'text-primary-500',
  },
  emerald: {
    headerIconGradient: 'from-green-500 to-emerald-600',
    headerIconShadow: 'shadow-green-500/20',
    ctaGradient: 'from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800',
    ctaTextMuted: 'text-green-100',
    ctaButtonText: 'text-green-600',
    ctaButtonHover: 'hover:bg-green-50',
    importButtonStyle: 'bg-green-600 text-white hover:bg-green-700',
    tipDot: 'text-green-500',
  },
} as const;

/* =============================================================================
   Component
============================================================================= */

const DEFAULT_LABELS: ProgramsPageLabels = {
  startGeneration: 'Start Generation',
  createManually: 'Create Manually',
  createManuallyShort: 'Manual',
  importShort: 'Import',
  didYouKnow: 'Did you know?',
};

export function ProgramsPageLayout({
  colorTheme,
  header,
  generatorCta,
  savedPrograms,
  featureCards,
  tips,
  extraContent,
  modals,
  onImportClick,
  createLink,
  importLabel = 'Import File',
  labels = DEFAULT_LABELS,
}: ProgramsPageLayoutProps) {
  const theme = themeConfig[colorTheme];

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
                theme.headerIconGradient,
                theme.headerIconShadow
              )}
            >
              {header.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {header.title}
              </h1>
              <p className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
                {header.subtitle}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onImportClick}
              className={cn(
                'group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200',
                theme.importButtonStyle
              )}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{importLabel}</span>
              <span className="sm:hidden">{labels.importShort}</span>
            </button>
            <Link
              href={createLink}
              className={cn(
                'group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200',
                'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                'dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
              )}
            >
              <Plus className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200" />
              <span className="hidden sm:inline">{labels.createManually}</span>
              <span className="sm:hidden">{labels.createManuallyShort}</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Generator + Programs */}
          <div className="space-y-8 lg:col-span-8">
            {/* Generator Call-to-Action Card */}
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-xl',
                theme.ctaGradient
              )}
            >
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  AI POWERED
                </div>
                <h2 className="mb-3 text-3xl font-bold">{generatorCta.title}</h2>
                <p className={cn('mb-8 max-w-xl text-lg', theme.ctaTextMuted)}>
                  {generatorCta.description}
                </p>

                <Link href={generatorCta.generateLink}>
                  <button
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95',
                      theme.ctaButtonText,
                      theme.ctaButtonHover
                    )}
                  >
                    {labels.startGeneration}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Saved Programs Section */}
            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                  {savedPrograms.icon}
                  {savedPrograms.title}
                </h2>
              </div>
              {savedPrograms.content}
            </div>

            {/* Extra Content (e.g., Tools section for nutrition) */}
            {extraContent}
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            {/* Feature Cards */}
            {featureCards.map((card, index) => (
              <Card key={index} variant="glass" className="p-6">
                <div className={cn('mb-4 inline-flex rounded-lg p-2', card.iconBgClass)}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {card.description}
                </p>
              </Card>
            ))}

            {/* Quick Tips */}
            <Card variant="glass" className="p-6" glassIntensity="light">
              <h4 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">
                {labels.didYouKnow}
              </h4>
              <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                {tips.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className={theme.tipDot}>•</span>
                    {tip.text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modals}
    </div>
  );
}
