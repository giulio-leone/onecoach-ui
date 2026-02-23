/**
 * DatePicker Component - React Native
 *
 * Mobile-optimized date picker with modal calendar UI.
 * Consistent API with web version.
 */

import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import {
  type DatePickerProps,
  defaultTranslations,
  formatDateDisplay,
  generateCalendarDays,
  isSameDay,
  isToday,
  isDateInRange,
} from './date-picker.shared';

export type { DatePickerProps, DatePickerTranslations } from './date-picker.shared';

export function DatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  translations = defaultTranslations,
}: DatePickerProps): React.ReactElement {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  const t = translations;

  const weeks = useMemo(
    () => generateCalendarDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const handlePreviousMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, minDate, maxDate)) return;
      onChange(date);
      setModalVisible(false);
    },
    [onChange, minDate, maxDate]
  );

  const handleToday = useCallback(() => {
    const today = new Date();
    if (isDateInRange(today, minDate, maxDate)) {
      onChange(today);
      setViewDate(today);
      setModalVisible(false);
    }
  }, [onChange, minDate, maxDate]);

  const displayValue = value ? formatDateDisplay(value, t.months) : (placeholder ?? t.selectDate);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Calendar size={16} color="#3b82f6" />
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>{displayValue}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t.selectDate}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Month navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
                <ChevronLeft size={20} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.monthYear}>
                {t.months[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <ChevronRight size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdaysRow}>
              {t.weekdays.short.map((day) => (
                <View key={day} style={styles.weekdayCell}>
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <ScrollView style={styles.calendarGrid}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <View key={dayIndex} style={styles.dayCell} />;
                    }

                    const isSelected = value && isSameDay(date, value);
                    const isTodayDate = isToday(date);
                    const isDisabledDate = !isDateInRange(date, minDate, maxDate);

                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        style={[
                          styles.dayCell,
                          styles.dayButton,
                          isSelected && styles.selectedDay,
                          isTodayDate && !isSelected && styles.todayDay,
                          isDisabledDate && styles.disabledDay,
                        ]}
                        onPress={() => handleSelectDate(date)}
                        disabled={isDisabledDate}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            isTodayDate && !isSelected && styles.todayDayText,
                            isDisabledDate && styles.disabledDayText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* Today button */}
            <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>{t.today}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
  },
  closeButton: {
    padding: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  calendarGrid: {
    maxHeight: 240,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedDay: {
    backgroundColor: '#2563eb',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayDay: {
    backgroundColor: '#dbeafe',
  },
  todayDayText: {
    color: '#1d4ed8',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#9ca3af',
  },
  todayButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});
