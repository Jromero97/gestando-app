import { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { currentDateLocale } from '../i18n';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
}

/** Cross-platform date picker: Android uses the imperative native dialog, iOS the inline one. */
export function DatePickerField({ label, value, onChange, mode = 'date' }: Props) {
  const { t } = useTranslation();
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        onValueChange: (_event, date) => onChange(date),
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  return (
    <View className="mb-4">
      <Text className="mb-1 font-semi text-sm text-muted">{label}</Text>
      <TouchableOpacity
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="rounded-xl border border-neutral-200 bg-background px-4 py-3"
      >
        <Text className="font-sans text-base text-ink">
          {mode === 'time'
            ? value.toLocaleTimeString(currentDateLocale(), { hour: '2-digit', minute: '2-digit' })
            : value.toLocaleDateString(currentDateLocale(), { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" visible={showIOSPicker} onRequestClose={() => setShowIOSPicker(false)}>
          <TouchableOpacity
            className="flex-1 items-center justify-center bg-ink/40"
            activeOpacity={1}
            onPress={() => setShowIOSPicker(false)}
          >
            <TouchableOpacity activeOpacity={1} className="rounded-3xl bg-surface p-4">
              <DateTimePicker
                value={value}
                mode={mode}
                display={mode === 'time' ? 'spinner' : 'inline'}
                onValueChange={(_event, date) => onChange(date)}
              />
              <TouchableOpacity
                onPress={() => setShowIOSPicker(false)}
                className="mt-3 items-center rounded-2xl bg-primary py-3"
              >
                <Text className="font-semi text-base text-ink">{t('common.done')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
