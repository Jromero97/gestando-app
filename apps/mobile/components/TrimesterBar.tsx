import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function TrimesterBar({ trimester }: { trimester: 1 | 2 | 3 }) {
  const { t } = useTranslation();
  return (
    <View>
      <View className="flex-row gap-1.5">
        {[1, 2, 3].map((n) => (
          <View key={n} className={`h-1.5 flex-1 rounded-full ${n === trimester ? 'bg-primary' : 'bg-rose'}`} />
        ))}
      </View>
      <View className="mt-1 flex-row justify-between">
        <Text className="font-semi text-xs text-muted">{t('common.trimesterOrdinal.1')}</Text>
        <Text className="font-semi text-xs text-muted">{t('common.trimesterOrdinal.2')}</Text>
        <Text className="font-semi text-xs text-muted">{t('common.trimesterOrdinal.3')}</Text>
      </View>
    </View>
  );
}
