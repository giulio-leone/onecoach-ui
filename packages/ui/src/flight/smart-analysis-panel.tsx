'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendDown,
  TrendUp,
  Clock,
  AirplaneTilt,
  CheckCircle,
  Lightbulb,
  CaretDown,
  CaretUp,
  Sparkle,
  Lightning,
  Target,
  SealCheck,
  ArrowSquareOut,
  Heart,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react';
import { cn } from '@giulio-leone/lib-design-system';
import { Button, Badge } from '@giulio-leone/ui';
import type { FlightAnalysis, FlightRecommendation } from '@giulio-leone/types/flight';

// Re-export types for consumers
export type { FlightAnalysis, FlightRecommendation };

// ==================== TYPES ====================

export interface SmartAnalysisPanelProps {
  analysis: FlightAnalysis;
  recommendation: FlightRecommendation;
  alternatives?: FlightRecommendation[];
  onSelectRecommendation?: (rec: FlightRecommendation) => void;
  onSave?: (rec: FlightRecommendation) => void;
  isSaved?: boolean;
  className?: string;
}

// ==================== STRATEGY CONFIG ====================

const STRATEGY_CONFIG: Record<
  FlightRecommendation['strategy'],
  {
    icon: typeof Sparkle;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    gradientFrom: string;
    gradientTo: string;
  }
> = {
  best_value: {
    icon: SealCheck,
    label: 'Best Value',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/30',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-500',
  },
  cheapest: {
    icon: TrendDown,
    label: 'Cheapest',
    colorClass: 'text-primary-600 dark:text-primary-400',
    bgClass: 'bg-primary-500',
    borderClass: 'border-primary-500/30',
    gradientFrom: 'from-primary-500',
    gradientTo: 'to-cyan-500',
  },
  fastest: {
    icon: Lightning,
    label: 'Fastest',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500/30',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
  },
  most_convenient: {
    icon: Target,
    label: 'Most Convenient',
    colorClass: 'text-secondary-600 dark:text-secondary-400',
    bgClass: 'bg-secondary-500',
    borderClass: 'border-secondary-500/30',
    gradientFrom: 'from-secondary-500',
    gradientTo: 'to-secondary-500',
  },
  flexible_combo: {
    icon: Sparkle,
    label: 'Smart Combo',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-500',
    borderClass: 'border-rose-500/30',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-red-500',
  },
};

// ==================== MAIN COMPONENT ====================

export function SmartAnalysisPanel({
  analysis,
  recommendation,
  alternatives,
  onSelectRecommendation,
  onSave,
  isSaved,
  className,
}: SmartAnalysisPanelProps) {
  const t = useTranslations('flight');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const strategyConfig = STRATEGY_CONFIG[recommendation.strategy];
  const StrategyIcon = strategyConfig.icon;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'border-2 border-indigo-500/20 dark:border-indigo-400/20',
        'bg-gradient-to-br from-white via-indigo-50/30 to-secondary-50/30',
        'dark:from-neutral-900 dark:via-indigo-950/20 dark:to-secondary-950/20',
        'shadow-xl shadow-indigo-500/5',
        className
      )}
    >
      {/* Decorative Background Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 to-secondary-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <button
        type="button"
        className="relative flex w-full items-center justify-between p-5 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* AI Icon with Glow */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 opacity-30 blur-md" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-xl shadow-secondary-500/30">
              <Brain className="h-7 w-7 text-white" weight="duotone" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {t('smartSearch.aiAnalysis') || 'AI Analysis'}
              </h3>
              <Badge
                variant="outline"
                className="border-secondary-500/30 bg-secondary-500/10 text-secondary-600 dark:text-secondary-400"
              >
                <Sparkle className="mr-1 h-3 w-3" weight="fill" />
                OneAgent
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {t('smartSearch.poweredByAgent') || 'Intelligent flight recommendations'}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/[0.04]"
        >
          <CaretDown className="h-5 w-5" weight="bold" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative overflow-hidden"
          >
            <div className="space-y-5 px-5 pb-5">
              {/* Primary Recommendation Card */}
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl border-2 p-5',
                  strategyConfig.borderClass,
                  'bg-gradient-to-br from-white to-neutral-50',
                  'dark:from-neutral-800/80 dark:to-neutral-900/80'
                )}
              >
                {/* Strategy badge glow */}
                <div
                  className={cn(
                    'absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-3xl',
                    `bg-gradient-to-br ${strategyConfig.gradientFrom} ${strategyConfig.gradientTo}`
                  )}
                />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Strategy Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg',
                          `bg-gradient-to-br ${strategyConfig.gradientFrom} ${strategyConfig.gradientTo}`
                        )}
                      >
                        <StrategyIcon className="h-6 w-6" weight="duotone" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-lg font-bold', strategyConfig.colorClass)}>
                            {strategyConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/[0.08]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${recommendation.confidence * 100}%` }}
                              className={cn(
                                'h-full rounded-full',
                                `bg-gradient-to-r ${strategyConfig.gradientFrom} ${strategyConfig.gradientTo}`
                              )}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-500">
                            {Math.round(recommendation.confidence * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {recommendation.reasoning}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {/* Round-trip with separate links: show dual booking buttons */}
                      {recommendation.returnDeepLink && recommendation.outboundDeepLink ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={recommendation.outboundDeepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all',
                              'shadow-lg hover:-translate-y-0.5 hover:shadow-xl',
                              `bg-gradient-to-r ${strategyConfig.gradientFrom} ${strategyConfig.gradientTo}`
                            )}
                          >
                            <AirplaneTilt className="h-4 w-4" weight="fill" />
                            {t('smartSearch.bookOutbound') || 'Book Outbound'}
                          </a>
                          <a
                            href={recommendation.returnDeepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all',
                              'hover:-translate-y-0.5 hover:shadow-lg',
                              strategyConfig.borderClass,
                              strategyConfig.colorClass,
                              'bg-white dark:bg-white/[0.04]'
                            )}
                          >
                            <AirplaneTilt className="h-4 w-4 rotate-180" weight="duotone" />
                            {t('smartSearch.bookReturn') || 'Book Return'}
                          </a>
                        </div>
                      ) : recommendation.deepLink ? (
                        /* Single booking link (one-way or combined round-trip) */
                        <a
                          href={recommendation.deepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all',
                            'shadow-lg hover:-translate-y-0.5 hover:shadow-xl',
                            `bg-gradient-to-r ${strategyConfig.gradientFrom} ${strategyConfig.gradientTo}`
                          )}
                        >
                          <ArrowSquareOut className="h-4 w-4" weight="bold" />
                          {t('smartSearch.bookNow') || 'Book Now'}
                        </a>
                      ) : (
                        /* Fallback: No deep links available */
                        <Button disabled variant="secondary" className="rounded-xl opacity-50">
                          {t('smartSearch.bookingUnavailable') || 'Booking Unavailable'}
                        </Button>
                      )}
                      {onSelectRecommendation && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-neutral-200/60 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
                          onClick={() => onSelectRecommendation(recommendation)}
                        >
                          <CheckCircle className="mr-1.5 h-4 w-4" weight="bold" />
                          {t('smartSearch.selectFlights') || 'Select'}
                        </Button>
                      )}
                      {onSave && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.06]',
                            isSaved && 'text-red-500 dark:text-red-400'
                          )}
                          onClick={() => onSave(recommendation)}
                        >
                          <Heart
                            className={cn('mr-1.5 h-4 w-4', isSaved && 'fill-current')}
                            weight={isSaved ? 'fill' : 'regular'}
                          />
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-neutral-500">Total Price</span>
                    <span className="text-4xl font-black text-neutral-900 dark:text-white">
                      €{recommendation.totalPrice}
                    </span>
                    <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" weight="fill" />
                      Best deal found
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternatives Section */}
              {alternatives && alternatives.length > 0 && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    {showAlternatives ? (
                      <CaretUp className="h-4 w-4" weight="bold" />
                    ) : (
                      <CaretDown className="h-4 w-4" weight="bold" />
                    )}
                    {t('smartSearch.showAlternatives') || 'View alternatives'} (
                    {alternatives.length})
                  </button>

                  <AnimatePresence>
                    {showAlternatives && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 gap-2 overflow-hidden sm:grid-cols-2"
                      >
                        {alternatives.map((alt, idx) => {
                          const altConfig = STRATEGY_CONFIG[alt.strategy];
                          const AltIcon = altConfig.icon;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={cn(
                                'flex items-center justify-between rounded-xl border p-3 transition-colors',
                                'border-neutral-200/60 bg-white hover:border-neutral-300',
                                'dark:border-white/[0.08] dark:bg-neutral-800/50 dark:hover:border-neutral-600'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg text-white',
                                    `bg-gradient-to-br ${altConfig.gradientFrom} ${altConfig.gradientTo}`
                                  )}
                                >
                                  <AltIcon className="h-4 w-4" weight="duotone" />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {altConfig.label}
                                  </span>
                                  <p className="text-xs text-neutral-500">
                                    {Math.round(alt.confidence * 100)}% match
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                                  €{alt.totalPrice}
                                </span>
                                {onSelectRecommendation && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectRecommendation(alt)}
                                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/[0.08] dark:hover:text-white"
                                  >
                                    <ArrowRight className="h-4 w-4" weight="bold" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Market Summary */}
              <div className="rounded-2xl bg-neutral-100/80 p-4 dark:bg-neutral-800/50">
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {analysis.marketSummary}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <QuickStat
                  icon={TrendDown}
                  label={t('smartSearch.avgOutbound') || 'Avg Outbound'}
                  value={`€${analysis.priceAnalysis.avgOutboundPrice}`}
                  isPositive={analysis.priceAnalysis.isPriceGood}
                />
                {analysis.priceAnalysis.avgReturnPrice && (
                  <QuickStat
                    icon={TrendUp}
                    label={t('smartSearch.avgReturn') || 'Avg Return'}
                    value={`€${analysis.priceAnalysis.avgReturnPrice}`}
                  />
                )}
                <QuickStat
                  icon={AirplaneTilt}
                  label={t('smartSearch.directFlights') || 'Direct'}
                  value={analysis.scheduleAnalysis.hasGoodDirectOptions ? 'Available' : 'Limited'}
                  isPositive={analysis.scheduleAnalysis.hasGoodDirectOptions}
                />
                <QuickStat
                  icon={Clock}
                  label={t('smartSearch.bestTime') || 'Best Time'}
                  value={analysis.scheduleAnalysis.bestTimeToFly}
                />
              </div>

              {/* Key Insights */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" weight="fill" />
                  </div>
                  {t('smartSearch.keyInsights') || 'Key Insights'}
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {analysis.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl bg-white/60 p-3 dark:bg-white/[0.04]"
                    >
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500"
                        weight="fill"
                      />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {insight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Tips */}
              {analysis.savingsTips && analysis.savingsTips.length > 0 && (
                <div
                  className={cn(
                    'rounded-2xl border p-4',
                    'border-emerald-200 bg-emerald-50',
                    'dark:border-emerald-800/40 dark:bg-emerald-950/20'
                  )}
                >
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    <Sparkle className="h-4 w-4" weight="fill" />
                    {t('smartSearch.savingsTips') || 'Money-Saving Tips'}
                  </h4>
                  <ul className="space-y-2">
                    {analysis.savingsTips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" weight="duotone" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

interface QuickStatProps {
  icon: typeof Clock;
  label: string;
  value: string;
  isPositive?: boolean;
}

function QuickStat({ icon: Icon, label, value, isPositive }: QuickStatProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-3 text-center transition-colors',
        'bg-white/60 dark:bg-white/[0.04]'
      )}
    >
      <div
        className={cn(
          'mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg',
          isPositive
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-neutral-200/50 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-400'
        )}
      >
        <Icon className="h-4 w-4" weight="duotone" />
      </div>
      <p className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-sm font-bold',
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default SmartAnalysisPanel;
