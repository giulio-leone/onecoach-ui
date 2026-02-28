'use client';

import { useTranslations } from 'next-intl';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useBodyMeasurementsHistory } from '@giulio-leone/lib-api/hooks';
import { Card } from '@giulio-leone/ui';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function BodyAnalysisCharts() {
  const t = useTranslations('common');

  const { data: measurements } = useBodyMeasurementsHistory(30); // Last 30 entries

  if (!measurements || measurements.length < 2) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM', { locale: it });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="h-[300px] border-neutral-200 bg-white/50 p-4 backdrop-blur-sm dark:border-white/[0.08] dark:bg-black/50">
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
          {t('profile.analysis_charts.peso_corporeo_kg')}
        </h3>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <LineChart data={measurements} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Peso"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[300px] border-neutral-200 bg-white/50 p-4 backdrop-blur-sm dark:border-white/[0.08] dark:bg-black/50">
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
          {t('profile.analysis_charts.massa_grassa')}
        </h3>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <LineChart data={measurements} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="bodyFat"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Body Fat %"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
