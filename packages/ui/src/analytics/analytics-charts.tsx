'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, LoadingIndicator, Text, Heading } from '@giulio-leone/ui';

import { AlertTriangle } from 'lucide-react';

export interface AnalyticsChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface AnalyticsChartProps {
  data: AnalyticsChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  datasets: Array<{
    label: string;
    dataKey: string;
    color?: string;
  }>;
  isLoading?: boolean;
  className?: string;
  height?: number;
}

const defaultColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

type TooltipEntry = {
  color?: string;
  name?: string;
  value?: string | number;
};

type TooltipPayload = TooltipEntry[];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-white/80 p-3 shadow-lg backdrop-blur-md dark:bg-black/80">
        <Text weight="medium" className="mb-2 text-neutral-900 dark:text-white">
          {label}
        </Text>
        {payload.map((entry, index) => {
          if (!entry) return null;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-neutral-600 dark:text-neutral-300">{entry.name}:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function AnalyticsChart({
  data,
  type,
  title,
  datasets,
  isLoading = false,
  className = '',
  height = 300,
}: AnalyticsChartProps) {
  if (isLoading) {
    return (
      <Card
        variant="glass"
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <LoadingIndicator />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card
        variant="glass"
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="mb-2 h-8 w-8 text-neutral-400" />
          <Text className="text-neutral-500 dark:text-neutral-400">Nessun dato disponibile</Text>
        </div>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const AxisProps = {
      stroke: '#888888',
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888840" />
            <XAxis dataKey="date" {...AxisProps} dy={10} />
            <YAxis {...AxisProps} dx={-10} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#888888', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {datasets.map((dataset, index) => (
              <Line
                key={dataset.dataKey}
                type="monotone"
                dataKey={dataset.dataKey}
                name={dataset.label}
                stroke={dataset.color || defaultColors[index % defaultColors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888840" />
            <XAxis dataKey="date" {...AxisProps} dy={10} />
            <YAxis {...AxisProps} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#88888820' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {datasets.map((dataset, index) => (
              <Bar
                key={dataset.dataKey}
                dataKey={dataset.dataKey}
                name={dataset.label}
                fill={dataset.color || defaultColors[index % defaultColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {datasets.map((dataset, index) => (
                <linearGradient
                  key={`gradient-${dataset.dataKey}`}
                  id={`gradient-${dataset.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={dataset.color || defaultColors[index % defaultColors.length]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={dataset.color || defaultColors[index % defaultColors.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888840" />
            <XAxis dataKey="date" {...AxisProps} dy={10} />
            <YAxis {...AxisProps} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {datasets.map((dataset, index) => (
              <Area
                key={dataset.dataKey}
                type="monotone"
                dataKey={dataset.dataKey}
                name={dataset.label}
                stroke={dataset.color || defaultColors[index % defaultColors.length]}
                fill={`url(#gradient-${dataset.dataKey})`}
                strokeWidth={3}
              />
            ))}
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      {title && (
        <Heading level={3} size="lg" weight="semibold" className="mb-6 text-neutral-900 dark:text-white">
          {title}
        </Heading>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() ?? <></>}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
