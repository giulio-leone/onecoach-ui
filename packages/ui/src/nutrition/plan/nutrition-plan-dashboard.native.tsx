import type { NutritionPlan } from '@giulio-leone/types/nutrition';

import { ScrollView, Text, View } from 'react-native';

export interface NutritionPlanDashboardProps {
  plan: NutritionPlan;
  onWeekChange: (weekNumber: number) => void;
  onDayChange: (dayNumber: number) => void;
  onCopyDay: (fromWeek: number, fromDay: number, toWeek: number, toDay: number) => void;
  onSwapDays: (weekA: number, dayA: number, weekB: number, dayB: number) => void;
  onEditDay: (weekNumber: number, dayNumber: number) => void;
  onGenerateShoppingList: (weekNumber: number) => void;
  onSave: () => void;
  onPublish: () => void;
  isLoading?: boolean;
}

/**
 * Native implementation placeholder.
 *
 * The full dashboard UI is currently web-first (uses DOM + animations).
 * On native we render a simple summary and keep actions available for future work.
 */
export function NutritionPlanDashboard({ plan }: NutritionPlanDashboardProps) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{plan.name}</Text>
        {plan.description ? (
          <Text style={{ marginTop: 4, color: '#6b7280' }}>{plan.description}</Text>
        ) : null}
      </View>

      <View>
        <Text style={{ color: '#6b7280' }}>
          Dashboard nutrizionale non ancora disponibile su mobile.
        </Text>
      </View>
    </ScrollView>
  );
}
