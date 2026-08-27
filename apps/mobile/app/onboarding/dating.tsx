import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WizardHeader } from '../../components/WizardHeader';
import { DatePickerField } from '../../components/DatePickerField';
import { PillToggle } from '../../components/PillToggle';
import { useOnboardingDraftStore } from '../../store/useOnboardingDraftStore';
import { currentDateLocale } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';
import { datesFromUltrasound, dueDateFromLmp, gestationalAgeAt } from '../../utils/dating';

type Method = 'lmp' | 'ultrasound';

export default function OnboardingDatingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setDates = useOnboardingDraftStore((s) => s.setDates);
  const draftLmp = useOnboardingDraftStore((s) => s.lastMenstrualPeriod);

  const [method, setMethod] = useState<Method>('lmp');
  const [lmpDate, setLmpDate] = useState(draftLmp ?? new Date());
  const [ultrasoundDate, setUltrasoundDate] = useState(new Date());
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState('12');
  const [ultrasoundDays, setUltrasoundDays] = useState('0');

  const { lastMenstrualPeriod, dueDate } = useMemo(() => {
    if (method === 'lmp') {
      return { lastMenstrualPeriod: lmpDate, dueDate: dueDateFromLmp(lmpDate) };
    }
    return datesFromUltrasound(ultrasoundDate, parseInt(ultrasoundWeeks || '0', 10), parseInt(ultrasoundDays || '0', 10));
  }, [method, lmpDate, ultrasoundDate, ultrasoundWeeks, ultrasoundDays]);

  const currentAge = gestationalAgeAt(lastMenstrualPeriod, new Date());

  function handleContinue() {
    setDates(dueDate, lastMenstrualPeriod);
    router.push('/onboarding/details');
  }

  function handleSkip() {
    router.push('/onboarding/details');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <WizardHeader step={2} totalSteps={4} />

      <Text className="mt-6 font-display text-2xl text-ink">{t('onboarding.dating.title')}</Text>
      <Text className="mt-1 font-semi text-sm text-muted">{t('onboarding.dating.subtitle')}</Text>

      <View className="mt-6">
        <PillToggle
          value={method}
          onChange={setMethod}
          options={[
            { value: 'lmp', label: t('onboarding.dating.methodLmp') },
            { value: 'ultrasound', label: t('onboarding.dating.methodUltrasound') },
          ]}
        />
      </View>

      {method === 'lmp' ? (
        <View className="mt-4 rounded-card bg-surface p-5" style={CARD_SHADOW}>
          <DatePickerField label={t('onboarding.dating.lmpDateLabel')} value={lmpDate} onChange={setLmpDate} />
        </View>
      ) : (
        <View className="mt-4 rounded-card bg-surface p-5" style={CARD_SHADOW}>
          <DatePickerField
            label={t('onboarding.dating.ultrasoundDateLabel')}
            value={ultrasoundDate}
            onChange={setUltrasoundDate}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 font-semi text-sm text-muted">{t('onboarding.dating.ultrasoundWeeksLabel')}</Text>
              <TextInput
                className="rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
                value={ultrasoundWeeks}
                onChangeText={setUltrasoundWeeks}
                keyboardType="number-pad"
                accessibilityLabel={t('onboarding.dating.ultrasoundWeeksLabel')}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 font-semi text-sm text-muted">{t('onboarding.dating.ultrasoundDaysLabel')}</Text>
              <TextInput
                className="rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
                value={ultrasoundDays}
                onChangeText={setUltrasoundDays}
                keyboardType="number-pad"
                accessibilityLabel={t('onboarding.dating.ultrasoundDaysLabel')}
              />
            </View>
          </View>
        </View>
      )}

      <View className="mt-4 rounded-card bg-rose p-5">
        <Text className="font-semi text-xs uppercase text-primaryDark">{t('onboarding.dating.calculatedForYou')}</Text>
        <View className="mt-2 flex-row">
          <View className="flex-1">
            <Text className="font-display text-2xl text-ink">
              {currentAge.weeks} <Text className="text-base">+{currentAge.days}d</Text>
            </Text>
            <Text className="font-semi text-xs text-muted">{t('onboarding.dating.currentWeekLabel')}</Text>
          </View>
          <View className="flex-1 border-l border-primary/20 pl-4">
            <Text className="font-display text-2xl text-ink">
              {dueDate.toLocaleDateString(currentDateLocale(), { day: 'numeric', month: 'short' })}
            </Text>
            <Text className="font-semi text-xs text-muted">{t('onboarding.dating.dueDateLabel')}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleContinue} className="mt-6 items-center rounded-2xl bg-ink py-4">
        <Text className="font-semi text-base text-white">{t('common.continue')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} className="mt-3 items-center">
        <Text className="font-semi text-sm text-muted">{t('common.skipStep')}</Text>
      </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
