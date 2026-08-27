import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { fetchMonthMarks } from '../../services/diaryService';
import { fetchGestationalAge } from '../../services/pregnancyService';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';
import { DayMark } from '../../types/pregnancy';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy',
};
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
  today: 'Today',
};

const todayStr = new Date().toISOString().slice(0, 10);

const DOT_COLORS = { symptoms: '#E28A96', appointment: '#5B5470', photo: '#8B7FD1' };

function buildMarkedDates(marks: DayMark[]) {
  const result: Record<string, any> = {};
  for (const mark of marks) {
    const dots = [];
    if (mark.hasSymptoms) dots.push({ key: 'symptoms', color: DOT_COLORS.symptoms });
    if (mark.hasAppointment) dots.push({ key: 'appointment', color: DOT_COLORS.appointment });
    if (mark.hasPhoto) dots.push({ key: 'photo', color: DOT_COLORS.photo });
    result[mark.date] = { dots };
  }
  result[todayStr] = { ...(result[todayStr] ?? { dots: [] }), selected: true, selectedColor: '#F7DFE2' };
  return result;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [monthLabel, setMonthLabel] = useState('');

  LocaleConfig.defaultLocale = i18n.language === 'en' ? 'en' : 'es';

  const loadMonth = useCallback(async (year: number, month: number) => {
    const marks = await fetchMonthMarks(year, month);
    setMarkedDates(buildMarkedDates(marks));
    setMonthLabel(
      new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(currentDateLocale(), {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      loadMonth(now.getFullYear(), now.getMonth() + 1);
      fetchGestationalAge()
        .then((age) => setCurrentWeek(age.weeks))
        .catch(() => setCurrentWeek(null));
    }, [loadMonth]),
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background pt-5">
      <View className="px-5">
        <Text className="font-display text-2xl text-ink">{t('tabs.calendar.title')}</Text>
        <Text className="mt-1 font-semi text-sm capitalize text-muted">
          {monthLabel}
          {currentWeek != null ? t('tabs.calendar.weekSuffix', { week: currentWeek }) : ''}
        </Text>
      </View>

      <View className="mx-5 mt-4 rounded-card bg-surface p-2" style={CARD_SHADOW}>
        <Calendar
          current={todayStr}
          markingType="multi-dot"
          onDayPress={(day: DateData) => router.push(`/day/${day.dateString}`)}
          onMonthChange={(month: DateData) => loadMonth(month.year, month.month)}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#C96A80',
            arrowColor: '#C96A80',
            textDayFontFamily: 'Nunito_600SemiBold',
            textMonthFontFamily: 'Nunito_800ExtraBold',
            textDayHeaderFontFamily: 'Nunito_600SemiBold',
          }}
        />

        <View className="flex-row justify-center gap-4 border-t border-neutral-100 py-3">
          <Legend color={DOT_COLORS.symptoms} label={t('tabs.calendar.legendSymptoms')} />
          <Legend color={DOT_COLORS.appointment} label={t('tabs.calendar.legendAppointment')} />
          <Legend color={DOT_COLORS.photo} label={t('tabs.calendar.legendPhoto')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="font-semi text-xs text-muted">{label}</Text>
    </View>
  );
}
