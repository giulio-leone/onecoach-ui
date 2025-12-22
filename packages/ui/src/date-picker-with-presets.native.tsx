/**
 * Date Picker With Presets Component - React Native
 *
 * Cross-platform date picker component with preset buttons
 * Mobile-optimized, accessible
 */

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Button } from './button';
import {
  type DatePickerWithPresetsProps,
  formatDateForInput,
  parseDateFromInput,
  isValidDateString,
} from './date-picker-with-presets.shared';

// Re-export types for convenience
export type { DatePickerWithPresetsProps, Presets } from './date-picker-with-presets.shared';

export function DatePickerWithPresets({ date, onDateChange, presets }: DatePickerWithPresetsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(formatDateForInput(date));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setError(null);

    // Validate and update date if valid
    if (isValidDateString(text)) {
      const newDate = parseDateFromInput(text);
      if (newDate) {
        onDateChange(newDate);
      }
    }
  };

  const handleInputBlur = () => {
    if (!isValidDateString(inputValue)) {
      setError('Formato data non valido (YYYY-MM-DD)');
      // Reset to current date if invalid
      setInputValue(formatDateForInput(date));
    }
  };

  const handlePresetClick = (presetDate: Date) => {
    const formatted = formatDateForInput(presetDate);
    setInputValue(formatted);
    setError(null);
    onDateChange(presetDate);
  };

  const openDatePicker = () => {
    if (Platform.OS === 'ios') {
      setIsModalVisible(true);
    }
    // On Android, we rely on the TextInput which should trigger native date picker
    // if the keyboard type is set appropriately
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.labelContainer}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Calendar size={16} color="#3b82f6" />
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={10}
            accessibilityLabel="Date picker input"
            accessibilityHint="Enter date in YYYY-MM-DD format"
          />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {presets && (
        <View style={styles.presetsContainer}>
          {Object.entries(presets).map(([label, presetDate]) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              onPress={() => handlePresetClick(presetDate)}
            >
              {label}
            </Button>
          ))}
        </View>
      )}

      {/* iOS Date Picker Modal - Optional enhancement */}
      {Platform.OS === 'ios' && isModalVisible && (
        <Modal
          visible={isModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleziona Data</Text>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
              {/* Note: For a full iOS date picker, you would use @react-native-community/datetimepicker */}
              {/* For now, we use the TextInput approach which works on both platforms */}
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={handleInputChange}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  inputContainer: {
    flex: 1,
    minWidth: 150,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    minWidth: 120,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  presetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
});
