import { Text, View } from 'react-native';
import { currentDateLocale } from '../i18n';

export function DateChip({ date }: { date: Date }) {
  const month = date.toLocaleDateString(currentDateLocale(), { month: 'short', timeZone: 'UTC' }).replace('.', '');
  return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-rose">
      <Text className="font-semi text-xs text-primaryDark">{month.toUpperCase()}</Text>
      <Text className="font-display text-xl text-ink">{date.getUTCDate()}</Text>
    </View>
  );
}
