import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WizardHeader } from '../../components/WizardHeader';
import { useOnboardingDraftStore } from '../../store/useOnboardingDraftStore';
import { useAuthStore } from '../../store/useAuthStore';
import { upsertProfile } from '../../services/profileService';
import { getApiErrorMessage } from '../../services/apiError';
import { gestationalAgeAt } from '../../utils/dating';
import { CARD_SHADOW } from '../../constants/shadow';

export default function OnboardingTeamScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const firstName = useAuthStore((s) => s.firstName);
  const refreshOnboardingStatus = useAuthStore((s) => s.refreshOnboardingStatus);
  const draft = useOnboardingDraftStore();
  const setMedicalTeam = useOnboardingDraftStore((s) => s.setMedicalTeam);
  const setReminders = useOnboardingDraftStore((s) => s.setReminders);
  const reset = useOnboardingDraftStore((s) => s.reset);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAge = gestationalAgeAt(draft.lastMenstrualPeriod ?? draft.dueDate, new Date());
  const daysUntilDue = Math.max(
    Math.round((draft.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
    0,
  );

  async function handleFinish() {
    setIsSaving(true);
    setError(null);
    try {
      await upsertProfile({
        dueDate: draft.dueDate.toISOString(),
        lastMenstrualPeriod: draft.lastMenstrualPeriod?.toISOString(),
        isFirstPregnancy: draft.isFirstPregnancy,
        babyCount: draft.babyCount,
        conditions: draft.conditions,
        primaryDoctorName: draft.primaryDoctorName || undefined,
        primaryClinicName: draft.primaryClinicName || undefined,
        reminderAppointments: draft.reminderAppointments,
        reminderWeighIn: draft.reminderWeighIn,
        reminderDiaryNote: draft.reminderDiaryNote,
        reminderDiaryNoteTime: draft.reminderDiaryNote ? draft.reminderDiaryNoteTime : undefined,
      });
      await refreshOnboardingStatus();
      reset();
      router.replace('/(tabs)');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <WizardHeader step={4} totalSteps={4} />

      <Text className="mt-6 font-display text-2xl text-ink">{t('onboarding.team.title')}</Text>
      <Text className="mt-1 font-semi text-sm text-muted">{t('onboarding.team.subtitle')}</Text>

      <View className="mt-6 rounded-card bg-surface p-5" style={CARD_SHADOW}>
        <Text className="mb-1 font-semi text-xs uppercase text-muted">{t('onboarding.team.doctorLabel')}</Text>
        <TextInput
          className="mb-4 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={draft.primaryDoctorName}
          onChangeText={(v) => setMedicalTeam(v, draft.primaryClinicName)}
          placeholder={t('onboarding.team.doctorPlaceholder')}
          accessibilityLabel={t('onboarding.team.doctorLabel')}
        />
        <Text className="mb-1 font-semi text-xs uppercase text-muted">{t('onboarding.team.clinicLabel')}</Text>
        <TextInput
          className="rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={draft.primaryClinicName}
          onChangeText={(v) => setMedicalTeam(draft.primaryDoctorName, v)}
          placeholder={t('onboarding.team.clinicPlaceholder')}
          accessibilityLabel={t('onboarding.team.clinicLabel')}
        />
      </View>

      <View className="mt-4 rounded-card bg-surface p-5" style={CARD_SHADOW}>
        <Text className="mb-3 font-semi text-xs uppercase text-muted">{t('onboarding.team.remindersTitle')}</Text>

        <ReminderRow
          title={t('onboarding.team.reminderAppointments')}
          subtitle={t('onboarding.team.reminderAppointmentsSubtitle')}
          value={draft.reminderAppointments}
          onChange={(v) => setReminders({ reminderAppointments: v })}
        />
        <ReminderRow
          title={t('onboarding.team.reminderWeighIn')}
          subtitle={t('onboarding.team.reminderWeighInSubtitle')}
          value={draft.reminderWeighIn}
          onChange={(v) => setReminders({ reminderWeighIn: v })}
        />
        <ReminderRow
          title={t('onboarding.team.reminderDiaryNote')}
          subtitle={t('onboarding.team.reminderDiaryNoteSubtitle', { time: draft.reminderDiaryNoteTime })}
          value={draft.reminderDiaryNote}
          onChange={(v) => setReminders({ reminderDiaryNote: v })}
          last
        />
      </View>

      <View className="mt-4 rounded-card bg-lavender p-5">
        <Text className="font-display text-base text-lavenderText">
          {t('onboarding.team.readyTitle', { name: firstName ? `, ${firstName}` : '' })}
        </Text>
        <Text className="mt-1 font-semi text-sm text-lavenderText/80">
          {t('onboarding.team.readySubtitle', {
            weeks: currentAge.weeks,
            days: currentAge.days,
            daysUntilDue,
          })}
        </Text>
      </View>

      {error && <Text className="mt-3 font-semi text-sm text-red-400">{error}</Text>}

      <TouchableOpacity onPress={handleFinish} disabled={isSaving} className="mt-6 items-center rounded-2xl bg-primary py-4">
        <Text className="font-semi text-base text-ink">{isSaving ? t('common.saving') : t('onboarding.team.finishButton')}</Text>
      </TouchableOpacity>

      <Text className="mt-3 text-center font-semi text-xs text-muted">{t('onboarding.team.footerNote')}</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ReminderRow({
  title,
  subtitle,
  value,
  onChange,
  last,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between py-2 ${last ? '' : 'border-b border-neutral-100'}`}>
      <View className="flex-1 pr-3">
        <Text className="font-semi text-sm text-ink">{title}</Text>
        <Text className="font-semi text-xs text-muted">{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#E28A96' }} />
    </View>
  );
}
