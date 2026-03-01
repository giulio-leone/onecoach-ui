import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Card } from './card.native'; // Explicitly use native version to avoid type pollution
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon | React.ElementType;
  subtitle?: string;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  style?: StyleProp<ViewStyle>;
  className?: string; // Kept for interface compatibility
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
  trend,
  style,
}: StatCardProps) {
  const gradients = {
    green: ['#22c55e', '#16a34a'],
    blue: ['#6366f1', '#4f46e5'],
    purple: ['#a855f7', '#9333ea'],
    orange: ['#f97316', '#ea580c'],
    red: ['#ef4444', '#dc2626'],
  };

  const gradientColors = (gradients[color as keyof typeof gradients] || gradients.blue) as [
    string,
    string,
  ];

  return (
    <Card variant="elevated" style={[styles.card, style]} padding="md">
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{value}</Text>
          </View>
        </View>
        {Icon && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Icon size={24} color="white" />
          </LinearGradient>
        )}
      </View>

      {(subtitle || trend) && (
        <View style={styles.footer}>
          {trend && (
            <View
              style={[
                styles.trendBadge,
                trend.isPositive ? styles.trendPositive : styles.trendNegative,
              ]}
            >
              <Text
                style={[
                  styles.trendText,
                  trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative,
                ]}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#737373', // neutral-500
  },
  valueContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    color: '#171717', // neutral-900 (need dark mode handling ideally, but sticking to basics for now)
  },
  iconContainer: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    // shadow-sm logic if needed
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trendPositive: {
    backgroundColor: '#dcfce7', // green-100
  },
  trendNegative: {
    backgroundColor: '#fee2e2', // red-100
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendTextPositive: {
    color: '#15803d', // green-700
  },
  trendTextNegative: {
    color: '#b91c1c', // red-700
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a3a3a3', // neutral-400
  },
});
