import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-rose', text: 'text-primaryDark' },
  IN_PROGRESS: { bg: 'bg-lavender', text: 'text-lavenderText' },
  COMPLETED: { bg: 'bg-iceblue', text: 'text-iceblueText' },
  // neutral-500 on neutral-200 was 3.76:1, under WCAG AA's 4.5:1 minimum.
  CANCELLED: { bg: 'bg-neutral-200', text: 'text-neutral-600' },
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const style = STYLES[status] ?? STYLES.PENDING;
  return (
    <View className={`rounded-full px-3 py-1 ${style.bg}`}>
      <Text className={`font-semi text-xs ${style.text}`}>{t(`statusBadge.${status in STYLES ? status : 'PENDING'}`)}</Text>
    </View>
  );
}
