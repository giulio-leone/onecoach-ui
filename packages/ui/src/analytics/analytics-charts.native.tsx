import { View, Text, useColorScheme } from 'react-native';
import { Card } from '../card';
import { AlertTriangle } from 'lucide-react-native';

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

export function AnalyticsChart({
  title, className = '', height = 300 }: AnalyticsChartProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#a3a3a3' : '#737373';

  return (
    <Card
      variant="glass"
      className={`items-center justify-center p-6 ${className}`}
      style={{ height }}
    >
      {title && (
        <Text className="absolute top-6 left-6 mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </Text>
      )}
      <View className="items-center justify-center">
        <AlertTriangle size={32} color={iconColor} />
        <Text className="mt-4 text-center text-neutral-500 dark:text-neutral-400">
          I grafici non sono ancora disponibili su mobile.
          {'\n'}
          Controlla la versione web per i dettagli completi.
        </Text>
      </View>
    </Card>
  );
}
