import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

const SIZE = 140;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FULL_TERM_WEEKS = 40;

export function WeekProgressRing({ weeks }: { weeks: number }) {
  const { t } = useTranslation();
  const progress = Math.min(Math.max(weeks / FULL_TERM_WEEKS, 0), 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#F7DFE2"
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#E28A96"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <Text className="font-display text-4xl text-ink">{weeks}</Text>
      <Text className="font-semi text-xs tracking-wide text-muted">{t('weekProgress.weeks')}</Text>
    </View>
  );
}
