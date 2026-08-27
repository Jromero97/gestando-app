import { Text, View } from 'react-native';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * Web fallback: @react-native-community/datetimepicker ships no web
 * implementation at all, so the native picker is silently a no-op there.
 * Use the browser's own <input type="date"> instead.
 */
export function DatePickerField({ label, value, onChange }: Props) {
  const isoDate = value.toISOString().slice(0, 10);

  return (
    <View className="mb-4">
      <Text className="mb-1 font-semi text-sm text-muted">{label}</Text>
      <input
        type="date"
        value={isoDate}
        onChange={(e) => {
          if (!e.target.value) return;
          const [year, month, day] = e.target.value.split('-').map(Number);
          onChange(new Date(Date.UTC(year, month - 1, day)));
        }}
        style={{
          borderRadius: 12,
          border: '1px solid #e5e5e5',
          padding: '12px 16px',
          fontSize: 16,
          fontFamily: 'inherit',
          color: '#2B2A33',
          backgroundColor: '#FBF0EF',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </View>
  );
}
