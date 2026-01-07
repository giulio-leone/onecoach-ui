'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Plane, 
  CheckCircle2, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  BadgeCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { Card, Button, Badge } from '@onecoach/ui';

// ==================== TYPES ====================

export interface FlightAnalysis {
  marketSummary: string;
  priceAnalysis: {
    avgOutboundPrice: number;
    avgReturnPrice?: number;
    isPriceGood: boolean;
    priceTrend: string;
  };
  routeAnalysis: {
    bestOrigin?: string;
    originReason?: string;
    bestDestination?: string;
    destinationReason?: string;
  };
  scheduleAnalysis: {
    hasGoodDirectOptions: boolean;
    avgLayoverMinutes?: number;
    bestTimeToFly: string;
  };
  keyInsights: string[];
  savingsTips?: string[];
}

export interface FlightRecommendation {
  outboundFlightId: string;
  returnFlightId?: string;
  totalPrice: number;
  strategy: 'best_value' | 'cheapest' | 'fastest' | 'most_convenient' | 'flexible_combo';
  confidence: number;
  reasoning: string;
  /** Deep link to book this flight */
  deepLink?: string;
}

export interface SmartAnalysisPanelProps {
  analysis: FlightAnalysis;
  recommendation: FlightRecommendation;
  alternatives?: FlightRecommendation[];
  onSelectRecommendation?: (rec: FlightRecommendation) => void;
  className?: string;
}

// ==================== STRATEGY CONFIG ====================

const STRATEGY_CONFIG: Record<FlightRecommendation['strategy'], {
  icon: typeof Sparkles;
  label: string;
  color: string;
  gradient: string;
}> = {
  best_value: {
    icon: BadgeCheck,
    label: 'Best Value',
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  cheapest: {
    icon: TrendingDown,
    label: 'Cheapest',
    color: 'text-blue-500',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  fastest: {
    icon: Zap,
    label: 'Fastest',
    color: 'text-amber-500',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  most_convenient: {
    icon: Target,
    label: 'Most Convenient',
    color: 'text-purple-500',
    gradient: 'from-purple-500/10 to-pink-500/10',
  },
  flexible_combo: {
    icon: Sparkles,
    label: 'Smart Combo',
    color: 'text-rose-500',
    gradient: 'from-rose-500/10 to-red-500/10',
  },
};

// ==================== MAIN COMPONENT ====================

export function SmartAnalysisPanel({
  analysis,
  recommendation,
  alternatives,
  onSelectRecommendation,
  className,
}: SmartAnalysisPanelProps) {
  const t = useTranslations('flight');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const strategyConfig = STRATEGY_CONFIG[recommendation.strategy];
  const StrategyIcon = strategyConfig.icon;

  return (
    <Card
      variant="glass-premium"
      className={cn(
        'overflow-hidden border-2 border-blue-500/20',
        className
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              {t('smartSearch.aiAnalysis') || 'AI Analysis'}
            </h3>
            <p className="text-xs text-neutral-500">
              {t('smartSearch.poweredByAgent') || 'Powered by OneAgent SDK'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Primary Recommendation */}
              <div className={cn(
                'rounded-xl p-4 bg-gradient-to-r',
                strategyConfig.gradient
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-neutral-800/80 shadow-sm',
                    strategyConfig.color
                  )}>
                    <StrategyIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-bold', strategyConfig.color)}>
                          {strategyConfig.label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(recommendation.confidence * 100)}% confident
                        </Badge>
                      </div>
                      <span className="text-2xl font-black text-neutral-900 dark:text-white">
                        €{recommendation.totalPrice}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                      {recommendation.reasoning}
                    </p>
                    {onSelectRecommendation && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => onSelectRecommendation(recommendation)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {t('smartSearch.selectFlights') || 'Select These Flights'}
                      </Button>
                    )}
                    {recommendation.deepLink && (
                      <a
                        href={recommendation.deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 ml-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('smartSearch.bookNow') || 'Book Now'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Alternatives */}
              {alternatives && alternatives.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showAlternatives ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {t('smartSearch.showAlternatives') || 'Show alternatives'} ({alternatives.length})
                  </button>
                  
                  <AnimatePresence>
                    {showAlternatives && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2"
                      >
                        {alternatives.map((alt, idx) => {
                          const altConfig = STRATEGY_CONFIG[alt.strategy];
                          const AltIcon = altConfig.icon;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50"
                            >
                              <div className="flex items-center gap-2">
                                <AltIcon className={cn('h-4 w-4', altConfig.color)} />
                                <span className="text-sm font-medium">{altConfig.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">€{alt.totalPrice}</span>
                                {onSelectRecommendation && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelectRecommendation(alt)}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Market Summary */}
              <div className="rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 p-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {analysis.marketSummary}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <QuickStat
                  icon={TrendingDown}
                  label={t('smartSearch.avgOutbound') || 'Avg Outbound'}
                  value={`€${analysis.priceAnalysis.avgOutboundPrice}`}
                  color={analysis.priceAnalysis.isPriceGood ? 'text-emerald-500' : 'text-neutral-500'}
                />
                {analysis.priceAnalysis.avgReturnPrice && (
                  <QuickStat
                    icon={TrendingUp}
                    label={t('smartSearch.avgReturn') || 'Avg Return'}
                    value={`€${analysis.priceAnalysis.avgReturnPrice}`}
                    color="text-neutral-500"
                  />
                )}
                <QuickStat
                  icon={Plane}
                  label={t('smartSearch.directFlights') || 'Direct Options'}
                  value={analysis.scheduleAnalysis.hasGoodDirectOptions ? 'Yes' : 'Limited'}
                  color={analysis.scheduleAnalysis.hasGoodDirectOptions ? 'text-emerald-500' : 'text-amber-500'}
                />
                <QuickStat
                  icon={Clock}
                  label={t('smartSearch.bestTime') || 'Best Time'}
                  value={analysis.scheduleAnalysis.bestTimeToFly}
                  color="text-blue-500"
                />
              </div>

              {/* Key Insights */}
              <div>
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {t('smartSearch.keyInsights') || 'Key Insights'}
                </h4>
                <ul className="space-y-1">
                  {analysis.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Savings Tips */}
              {analysis.savingsTips && analysis.savingsTips.length > 0 && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('smartSearch.savingsTips') || 'Money-Saving Tips'}
                  </h4>
                  <ul className="space-y-1">
                    {analysis.savingsTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
    </Card>
  );
}

// ==================== SUB-COMPONENTS ====================

interface QuickStatProps {
  icon: typeof Clock;
  label: string;
  value: string;
  color: string;
}

function QuickStat({ icon: Icon, label, value, color }: QuickStatProps) {
  return (
    <div className="rounded-lg bg-white/50 dark:bg-neutral-800/50 p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className={cn('text-sm font-bold', color)}>{value}</p>
    </div>
  );
}

export default SmartAnalysisPanel;
