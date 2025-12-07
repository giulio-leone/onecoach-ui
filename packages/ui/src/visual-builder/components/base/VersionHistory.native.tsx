/**
 * VersionHistory Component - React Native
 *
 * Generic version history component for visual builders
 * React Native version using Uniwind
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface Version {
  id: string;
  version: number;
  createdAt: string | Date;
}

export interface VersionHistoryProps {
  versions: Version[];
  onRestore: (version: number) => void;
  className?: string;
  variant?: 'blue' | 'green';
}

export function VersionHistory({
  versions,
  onRestore,
  className = '',
  variant = 'blue',
}: VersionHistoryProps) {
  const gradientClass =
    variant === 'green' ? 'bg-green-600 dark:bg-green-700' : 'bg-blue-600 dark:bg-blue-700';

  return (
    <View
      className={cn(
        'overflow-hidden rounded-xl border p-4 shadow-sm sm:p-6',
        darkModeClasses.card.base,
        className
      )}
    >
      <Text
        className={cn(
          'mb-4 text-lg font-semibold sm:mb-6 sm:text-xl',
          darkModeClasses.text.primary
        )}
      >
        Cronologia Versioni
      </Text>
      <ScrollView>
        <View className="gap-2">
          {versions.length === 0 ? (
            <Text className={cn('text-sm', darkModeClasses.text.muted)}>
              Nessuna versione precedente
            </Text>
          ) : (
            versions.map((v: unknown) => (
              <View
                key={v.id}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border p-4 shadow-sm',
                  darkModeClasses.border.base,
                  darkModeClasses.bg.subtle
                )}
              >
                <View>
                  <Text className={cn('font-semibold', darkModeClasses.text.primary)}>
                    Versione {v.version}
                  </Text>
                  <Text
                    className={cn(
                      'mt-1 text-xs font-medium sm:text-sm',
                      darkModeClasses.text.muted
                    )}
                  >
                    {new Date(v.createdAt).toLocaleString('it-IT')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRestore(v.version)}
                  className={cn(
                    'min-h-[44px] touch-manipulation rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md',
                    gradientClass
                  )}
                >
                  <Text className="text-white">Ripristina</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
