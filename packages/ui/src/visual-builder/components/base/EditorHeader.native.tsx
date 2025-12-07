/**
 * EditorHeader Component - React Native
 *
 * Generic header component for visual builders (workout and nutrition)
 * React Native version using Uniwind
 */

import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Save, History } from 'lucide-react-native';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface EditorHeaderProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditMode: boolean;
  showVersions: boolean;
  onToggleVersions: () => void;
  saveButtonText?: string;
  saveButtonVariant?: 'blue' | 'green';
  className?: string;
}

export function EditorHeader({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSaving,
  isEditMode,
  showVersions: _showVersions,
  onToggleVersions,
  saveButtonText,
  saveButtonVariant = 'blue',
  className = '',
}: EditorHeaderProps) {
  const gradientClass =
    saveButtonVariant === 'green'
      ? 'bg-green-600 dark:bg-green-700'
      : 'bg-blue-600 dark:bg-blue-700';

  return (
    <View
      className={cn(
        'flex-col gap-4 overflow-hidden rounded-xl border p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6',
        darkModeClasses.card.base,
        className
      )}
    >
      <View className="flex-1 gap-2">
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Nome"
          placeholderTextColor="#9CA3AF"
          className={cn('w-full text-xl font-bold sm:text-2xl', darkModeClasses.text.primary)}
          style={{ backgroundColor: 'transparent' }}
        />
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Descrizione"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={2}
          className={cn('w-full text-sm sm:text-base', darkModeClasses.text.secondary)}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {isEditMode && (
          <TouchableOpacity
            onPress={onToggleVersions}
            className={cn(
              'min-h-[44px] touch-manipulation flex-row items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm',
              darkModeClasses.border.base,
              darkModeClasses.bg.base,
              darkModeClasses.text.secondary
            )}
          >
            <History size={16} color="#64748B" />
            <Text className={cn(darkModeClasses.text.secondary)}>Versioni</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          className={cn(
            'min-h-[44px] touch-manipulation flex-row items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50',
            gradientClass
          )}
        >
          <Save size={16} color="white" />
          <Text className="text-white">
            {isSaving ? 'Salvataggio...' : saveButtonText || (isEditMode ? 'Salva' : 'Crea')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
