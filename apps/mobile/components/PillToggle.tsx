import { Text, TouchableOpacity, View } from 'react-native';

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-shaped segmented control (Appointments/Exams, Grid/Line) */
export function PillToggle<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row rounded-full bg-neutral-200/70 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-full py-2 ${active ? 'bg-surface' : ''}`}
            style={
              active
                ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }
                : undefined
            }
          >
            <Text
              className={`font-semi text-sm ${
                option.disabled ? 'text-neutral-300' : active ? 'text-ink' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
