import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePregnancyStore } from '../../store/usePregnancyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { WeekProgressRing } from '../../components/WeekProgressRing';
import { TrimesterBar } from '../../components/TrimesterBar';
import { DateChip } from '../../components/DateChip';
import { getBabySizeForWeek } from '../../constants/babySize';
import { confirmAppointment } from '../../services/agendaService';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';

const FULL_TERM_WEEKS = 40;

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'tabs.dashboard.greetingMorning';
  if (hour < 20) return 'tabs.dashboard.greetingAfternoon';
  return 'tabs.dashboard.greetingNight';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { gestationalAge, nextAppointment, isLoading, error, loadDashboard, setNextAppointment } = usePregnancyStore();
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);
  const [isConfirming, setIsConfirming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  async function handleConfirmAttendance() {
    if (!nextAppointment) return;
    setIsConfirming(true);
    try {
      const updated = await confirmAppointment(nextAppointment.id);
      setNextAppointment(updated);
    } finally {
      setIsConfirming(false);
    }
  }

  if (isLoading && !gestationalAge) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#E28A96" size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center font-semi text-base text-primaryDark">{error}</Text>
      </SafeAreaView>
    );
  }

  const name = firstName ?? '';
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  const percent = gestationalAge ? Math.round(Math.min(gestationalAge.weeks / FULL_TERM_WEEKS, 1) * 100) : 0;
  const babySize = gestationalAge ? getBabySizeForWeek(gestationalAge.weeks) : null;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-semi text-base text-muted">{t(greetingKey())}</Text>
          <Text className="font-display text-3xl text-ink">{name}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-rose">
            <Ionicons name="notifications-outline" size={18} color="#E28A96" />
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-lavender">
            <Text className="font-display text-sm text-lavenderText">{initials}</Text>
          </View>
        </View>
      </View>

      {gestationalAge && (
        <View className="flex-row items-center gap-4 rounded-card bg-surface p-6" style={CARD_SHADOW}>
          <WeekProgressRing weeks={gestationalAge.weeks} />
          <View className="flex-1">
            <Text className="font-display text-xl text-ink">
              {t('tabs.dashboard.weekLabel', { weeks: gestationalAge.weeks })}
              <Text className="text-primary"> + {gestationalAge.days} {t('common.days')}</Text>
            </Text>
            <Text className="mt-1 font-semi text-sm text-muted">
              {t('tabs.dashboard.progressLabel', {
                trimester: t(`tabs.dashboard.trimester.${gestationalAge.trimester}`),
                percent,
              })}
            </Text>
            <View className="mt-3">
              <TrimesterBar trimester={gestationalAge.trimester} />
            </View>
          </View>
        </View>
      )}

      <View className="flex-row gap-3">
        {gestationalAge && (
          <View className="flex-1 rounded-card bg-surface p-4" style={CARD_SHADOW}>
            <Text className="font-semi text-xs uppercase text-muted">{t('tabs.dashboard.daysLeftLabel')}</Text>
            <Text className="mt-1 font-display text-2xl text-ink">
              {Math.max(gestationalAge.daysUntilDueDate, 0)} <Text className="text-base">{t('common.days')}</Text>
            </Text>
            <Text className="mt-1 font-semi text-xs text-muted">
              {t('tabs.dashboard.dueDatePrefix')}{' '}
              {new Date(gestationalAge.dueDate).toLocaleDateString(currentDateLocale(), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
        {babySize && (
          <View className="flex-1 rounded-card bg-lavender p-4" style={CARD_SHADOW}>
            <Text className="font-semi text-xs uppercase text-lavenderText/70">{t('tabs.dashboard.sizeLabel')}</Text>
            <Text className="mt-1 font-display text-base text-lavenderText">{babySize.comparison}</Text>
            <Text className="mt-1 font-semi text-xs text-lavenderText/70">
              {babySize.lengthCm} cm · {babySize.weightG} g
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-display text-lg text-ink">{t('tabs.dashboard.nextAppointmentTitle')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/agenda')}>
          <Text className="font-semi text-sm text-primary">{t('tabs.dashboard.viewAgenda')}</Text>
        </TouchableOpacity>
      </View>

      <View className="rounded-card bg-surface p-5" style={CARD_SHADOW}>
        {nextAppointment ? (
          <>
            <View className="flex-row gap-4">
              <DateChip date={new Date(nextAppointment.date)} />
              <View className="flex-1">
                <Text className="font-display text-base text-ink">{nextAppointment.title}</Text>
                {nextAppointment.doctorName && (
                  <Text className="mt-1 font-semi text-sm text-muted">
                    {t('tabs.dashboard.doctorPrefix', { name: nextAppointment.doctorName })}
                  </Text>
                )}
                <Text className="mt-1 font-semi text-sm text-lavenderText">
                  {new Date(nextAppointment.date).toLocaleTimeString(currentDateLocale(), {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {nextAppointment.location ? ` · ${nextAppointment.location}` : ''}
                </Text>
              </View>
            </View>
            <View className="mt-4 flex-row gap-3">
              {nextAppointment.confirmed ? (
                <View className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-lavender py-4">
                  <Ionicons name="checkmark-circle" size={18} color="#5B5470" />
                  <Text className="font-semi text-base text-lavenderText">{t('tabs.dashboard.attendanceConfirmed')}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleConfirmAttendance}
                  disabled={isConfirming}
                  className="flex-1 items-center rounded-2xl bg-ink py-4"
                >
                  <Text className="font-semi text-base text-white">
                    {isConfirming ? t('common.saving') : t('tabs.dashboard.confirmAttendance')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push(`/day/${nextAppointment.date.slice(0, 10)}`)}
                accessibilityLabel={t('tabs.dashboard.viewDay')}
                className="h-14 w-14 items-center justify-center rounded-2xl bg-background"
              >
                <Ionicons name="calendar-outline" size={20} color="#2B2A33" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className="font-semi text-base text-muted">{t('tabs.dashboard.noUpcomingAppointments')}</Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <QuickAccessCard
          color="#F7DFE2"
          icon="scale-outline"
          iconColor="#C96A80"
          label={t('tabs.dashboard.quickWeight')}
          onPress={() => router.push(`/day/${todayStr}`)}
        />
        <QuickAccessCard
          color="#E7E4FA"
          icon="pulse-outline"
          iconColor="#5B5470"
          label={t('tabs.dashboard.quickSymptoms')}
          onPress={() => router.push(`/day/${todayStr}`)}
        />
        <QuickAccessCard
          color="#DCEAF7"
          icon="footsteps-outline"
          iconColor="#4A7BA6"
          label={t('tabs.dashboard.quickKicks')}
          onPress={() => router.push(`/day/${todayStr}`)}
        />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

function QuickAccessCard({
  color,
  icon,
  iconColor,
  label,
  onPress,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center gap-2 rounded-card bg-surface p-4"
      style={CARD_SHADOW}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="font-semi text-sm text-ink">{label}</Text>
    </TouchableOpacity>
  );
}
