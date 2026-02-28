'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  type TooltipProps,
} from 'recharts';
import { cn } from '@giulio-leone/lib-design-system';
import { Activity, Dumbbell, TrendingUp, Zap, Layers, Repeat } from 'lucide-react';
import { Heading, Text } from '@giulio-leone/ui';
import type { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { WorkoutStatisticsService } from '@giulio-leone/lib-workout';
import { motion, type Variants } from 'framer-motion';
import { designTokens } from '@giulio-leone/lib-design-system';
import { useTheme } from '@giulio-leone/lib-shared';
import { useTranslations } from 'next-intl';
import type { WorkoutProgram } from '@giulio-leone/types/workout';

type ChartColors = {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  emerald: string;
  emeraldDark: string;
  blue: string;
  blueDark: string;
  purple: string;
  grid: string;
  text: string;
  background: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
};

interface WorkoutStatisticsProps {
  program: WorkoutProgram;
  customProgram?: WorkoutProgram; // Optional: allow passing a preview program
}

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

// Tooltip Component Definition (Outside main component to avoid re-creation)
// Tooltip Component Definition (Outside main component to avoid re-creation)
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  chartColors: ChartColors;
  isDark: boolean;
  payload?: Payload<ValueType, NameType>[];
  label?: NameType;
}

const CustomTooltip = ({ active, payload, label, chartColors, isDark }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl border p-3 shadow-xl backdrop-blur-xl"
        style={{
          backgroundColor: isDark ? 'rgba(23, 23, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: chartColors.tooltipBorder,
        }}
      >
        <p className="mb-1.5 text-sm font-semibold" style={{ color: chartColors.tooltipText }}>
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: Payload<ValueType, NameType>, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span style={{ color: chartColors.text }}>
                {entry.name ?? ''}:{' '}
                <span className="font-medium" style={{ color: chartColors.tooltipText }}>
                  {entry.value?.toLocaleString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WorkoutStatistics({ program, customProgram }: WorkoutStatisticsProps) {
  const t = useTranslations('workouts.builder.statistics');
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const themeColors = designTokens.colors as any;

  // Dynamic Chart Colors based on Design System Tokens
  const chartColors = useMemo<ChartColors>(
    () => ({
      primary: themeColors.primary[500],
      primaryDark: themeColors.primary[600],
      secondary: themeColors.secondary[500],
      secondaryDark: themeColors.secondary[600],
      accent: themeColors.primary[400],
      emerald: isDark
        ? (designTokens.colors.semantic.success.dark as any).border
        : (designTokens.colors.semantic.success.light as any).text,
      emeraldDark: isDark
        ? (designTokens.colors.semantic.success.dark as any).bg
        : (designTokens.colors.semantic.success.light as any).bg,

      blue: themeColors.primary[500],
      blueDark: themeColors.primary[600],
      purple: themeColors.primary[400],

      grid: isDark ? themeColors.neutral[800] : themeColors.neutral[200],
      text: isDark ? themeColors.text.secondary : themeColors.text.secondary,
      background: isDark ? themeColors.background.elevated : 'rgba(255, 255, 255, 0.9)',
      tooltipBg: isDark ? themeColors.neutral[900] : '#ffffff',
      tooltipBorder: isDark ? themeColors.neutral[800] : themeColors.border.light,
      tooltipText: isDark ? themeColors.text.primary : themeColors.text.primary,
    }),
    [isDark, themeColors]
  );

  // Refined Chart Colors for simple usage
  const colors = {
    primary: themeColors.primary[500],
    primaryDark: themeColors.primary[600],
    secondary: themeColors.secondary[500],
    secondaryDark: themeColors.secondary[600],
    accent: themeColors.primary[400],
    grid: themeColors.border.base,
    text: themeColors.text.secondary,
    background: themeColors.background.elevated,
  };

  const stats = useMemo(() => {
    return WorkoutStatisticsService.calculate(customProgram || program);
  }, [program, customProgram]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-6 p-4 pb-24 sm:p-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('avgIntensity'),
            value: `${stats.avgIntensity.toFixed(1)}%`,
            icon: Activity,
            color: 'blue',
          },
          {
            label: t('avgRpe'),
            value: `${stats.avgRpe.toFixed(1)}`,
            sub: '/10',
            icon: Zap,
            color: 'purple',
          },
          {
            label: t('totalVolume'),
            value: `${(stats.totalVolumeLoad / 1000).toFixed(1)}k`,
            sub: ' kg',
            icon: Dumbbell,
            color: 'emerald',
          },
          {
            label: t('totalLifts'),
            value: stats.totalLifts,
            icon: Repeat,
            color: 'orange',
          },
        ].map((item, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <div
              className={cn(
                'flex flex-row items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
              )}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${item.color}-500/10 text-${item.color}-600 ring-1 ring-${item.color}-500/20 dark:text-${item.color}-400`}
              >
                <item.icon size={24} />
              </div>
              <div>
                <Text size="sm" weight="medium" className="text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </Text>
                <Text weight="bold" className="text-2xl text-neutral-900 dark:text-white">
                  {item.value}
                  {item.sub && (
                    <Text as="span" size="sm" weight="normal" className="text-neutral-500">
                      {item.sub}
                    </Text>
                  )}
                </Text>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Muscle Volume Distribution */}
        <motion.div variants={itemVariants} className="h-full">
          <div
            className={cn(
              'flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
            )}
          >
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-md bg-primary-500/10 p-1.5 ring-1 ring-primary-500/20">
                <Layers size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <Heading
                level={3}
                size="lg"
                weight="semibold"
                className="text-neutral-900 dark:text-white"
              >
                {t('volumePerMuscle')}
              </Heading>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.muscleChartData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.grid}
                    opacity={0.1}
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: colors.text, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip chartColors={chartColors} isDark={true} />}
                    cursor={{
                      fill: 'rgba(255,255,255,0.05)',
                    }}
                  />
                  <Bar
                    dataKey="sets"
                    name={t('chart.sets')}
                    fill="url(#colorSets)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    animationDuration={1500}
                  />
                  <defs>
                    <linearGradient id="colorSets" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={colors.primary} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={colors.primaryDark} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Muscle Balance Radar */}
        <motion.div variants={itemVariants} className="h-full">
          <div
            className={cn(
              'flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
            )}
          >
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-md bg-secondary-500/10 p-1.5 ring-1 ring-secondary-500/20">
                <Activity size={18} className="text-secondary-600 dark:text-secondary-400" />
              </div>
              <Heading
                level={3}
                size="lg"
                weight="semibold"
                className="text-neutral-900 dark:text-white"
              >
                {t('balance')}
              </Heading>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.muscleChartData}>
                  <PolarGrid stroke={colors.grid} opacity={0.1} />
                  <PolarAngleAxis dataKey="name" tick={{ fill: colors.text, fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                  <Radar
                    name={t('chart.sets')}
                    dataKey="sets"
                    stroke={colors.secondaryDark}
                    fill={colors.secondary}
                    fillOpacity={0.4}
                  />
                  <Tooltip content={<CustomTooltip chartColors={chartColors} isDark={true} />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Progression */}
      <motion.div variants={itemVariants}>
        <div
          className={cn(
            'rounded-2xl border border-neutral-200 bg-neutral-50 p-6 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
          )}
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-md bg-emerald-500/10 p-1.5 ring-1 ring-primary-500/20">
              <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <Heading
              level={3}
              size="lg"
              weight="semibold"
              className="text-neutral-900 dark:text-white"
            >
              {t('weeklyProgression')}
            </Heading>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.weeklyStats}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: colors.text, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `W${val}`}
                />
                <YAxis yAxisId="left" orientation="left" stroke={colors.primary} hide />
                <YAxis yAxisId="right" orientation="right" stroke={colors.secondary} hide />
                <Tooltip
                  content={<CustomTooltip chartColors={chartColors} isDark={true} />}
                  cursor={{
                    stroke: colors.grid,
                    strokeWidth: 1,
                    strokeDasharray: '3 3',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volumeLoad"
                  name={t('chart.volume')}
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: colors.background,
                    stroke: colors.primary,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: colors.primary }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgIntensity"
                  name={t('chart.intensity')}
                  stroke={colors.secondary}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: colors.background,
                    stroke: colors.secondary,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: colors.secondary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Exercise Analysis */}
        <motion.div variants={itemVariants}>
          <div
            className={cn(
              'flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
            )}
          >
            <div className="border-b border-neutral-200 bg-neutral-100/50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-orange-500/10 p-1.5 ring-1 ring-orange-500/20">
                  <Repeat size={18} className="text-orange-600 dark:text-orange-400" />
                </div>
                <Heading
                  level={3}
                  size="lg"
                  weight="semibold"
                  className="text-neutral-900 dark:text-white"
                >
                  {t('exerciseAnalysis')}
                </Heading>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-100 text-neutral-500 dark:bg-black/20">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">
                      {t('headers.exercise')}
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      {t('headers.freq')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.sets')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.lifts')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.volume')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.maxKg')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  {stats.exerciseStats.slice(0, 8).map((ex: any) => (
                    <tr
                      key={ex.name}
                      className="transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
                    >
                      <td
                        className="max-w-[180px] truncate px-4 py-3 font-medium text-neutral-900 dark:text-neutral-200"
                        title={ex.name}
                      >
                        {ex.name}
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">
                        {ex.frequency}x
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {ex.totalSets}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {ex.totalLifts}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {(ex.volumeLoad / 1000).toFixed(1)}k
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900 dark:text-white">
                        {ex.maxWeight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.exerciseStats.length > 8 && (
                <div className="p-3 text-center text-xs text-neutral-500">
                  {t('otherExercises', { count: stats.exerciseStats.length - 8 })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Muscle Group Detailed Analysis */}
        <motion.div variants={itemVariants}>
          <div
            className={cn(
              'flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
            )}
          >
            <div className="border-b border-neutral-200 bg-neutral-100/50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-secondary-500/10 p-1.5 ring-1 ring-secondary-500/20">
                  <Dumbbell size={18} className="text-secondary-600 dark:text-secondary-400" />
                </div>
                <Heading
                  level={3}
                  size="lg"
                  weight="semibold"
                  className="text-neutral-900 dark:text-white"
                >
                  {t('muscleGroupDetails')}
                </Heading>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-100 text-neutral-500 dark:bg-black/20">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">
                      {t('headers.muscle')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.totalSets')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.lifts')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.volume')} (kg)
                    </th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {t('headers.volumePercent')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  {stats.muscleChartData.map((m: any) => (
                    <tr
                      key={m.name}
                      className="transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-200">
                        {m.name}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {m.sets}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {m.totalLifts}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {m.volumeLoad.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                        {stats.totalVolumeLoad > 0
                          ? ((m.volumeLoad / stats.totalVolumeLoad) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
