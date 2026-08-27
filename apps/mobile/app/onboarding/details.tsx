import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WizardHeader } from '../../components/WizardHeader';
import { PillToggle } from '../../components/PillToggle';
import { useOnboardingDraftStore } from '../../store/useOnboardingDraftStore';
import { updateMe } from '../../services/usersService';
import { CARD_SHADOW } from '../../constants/shadow';
import { PregnancyCondition, PregnancyCount } from '../../types/pregnancy';

const CONDITIONS: PregnancyCondition[] = ['ANEMIA', 'GESTATIONAL_DIABETES', 'HYPERTENSION', 'THYROID', 'HIGH_RISK'];

export default function OnboardingDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isFirstPregnancy, babyCount, conditions, setPregnancyDetails, toggleCondition } = useOnboardingDraftStore();

  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function goNext() {
    setIsSaving(true);
    try {
      await updateMe({
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        prePregnancyWeightKg: weightKg ? parseFloat(weightKg) : undefined,
      });
    } finally {
      setIsSaving(false);
      router.push('/onboarding/team');
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <WizardHeader step={3} totalSteps={4} />

      <Text className="mt-6 font-display text-2xl text-ink">{t('onboarding.details.title')}</Text>
      <Text className="mt-1 font-semi text-sm text-muted">{t('onboarding.details.subtitle')}</Text>

      <View className="mt-6 rounded-card bg-surface p-5" style={CARD_SHADOW}>
        <Text className="mb-2 font-semi text-xs uppercase text-muted">{t('onboarding.details.isFirstPregnancyLabel')}</Text>
        <PillToggle
          value={isFirstPregnancy === undefined ? '' : isFirstPregnancy ? 'yes' : 'no'}
          onChange={(v) => setPregnancyDetails({ isFirstPregnancy: v === 'yes' })}
          options={[
            { value: 'yes', label: t('onboarding.details.firstPregnancyYes') },
            { value: 'no', label: t('onboarding.details.firstPregnancyNo') },
          ]}
        />

        <Text className="mb-2 mt-5 font-semi text-xs uppercase text-muted">{t('onboarding.details.babyCountLabel')}</Text>
        <PillToggle
          value={babyCount ?? ''}
          onChange={(v) => setPregnancyDetails({ babyCount: v as PregnancyCount })}
          options={[
            { value: 'ONE', label: t('onboarding.details.babyCountOne') },
            { value: 'TWINS', label: t('onboarding.details.babyCountTwins') },
            { value: 'MORE', label: t('onboarding.details.babyCountMore') },
          ]}
        />
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-card bg-surface p-5" style={CARD_SHADOW}>
          <Text className="mb-1 font-semi text-xs uppercase text-muted">{t('onboarding.details.previousWeightLabel')}</Text>
          <TextInput
            className="font-display text-lg text-ink"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            placeholder={t('onboarding.details.previousWeightPlaceholder')}
            accessibilityLabel={t('onboarding.details.previousWeightLabel')}
          />
        </View>
        <View className="flex-1 rounded-card bg-surface p-5" style={CARD_SHADOW}>
          <Text className="mb-1 font-semi text-xs uppercase text-muted">{t('onboarding.details.heightLabel')}</Text>
          <TextInput
            className="font-display text-lg text-ink"
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="decimal-pad"
            placeholder={t('onboarding.details.heightPlaceholder')}
            accessibilityLabel={t('onboarding.details.heightLabel')}
          />
        </View>
      </View>

      <Text className="mb-2 mt-4 font-semi text-xs uppercase text-muted">{t('onboarding.details.conditionsLabel')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {CONDITIONS.map((value) => {
          const active = conditions.includes(value);
          return (
            <TouchableOpacity
              key={value}
              onPress={() => toggleCondition(value)}
              className={`rounded-2xl border px-4 py-2 ${active ? 'border-lavenderText bg-lavender' : 'border-neutral-200 bg-surface'}`}
            >
              <Text className={`font-semi text-sm ${active ? 'text-lavenderText' : 'text-ink'}`}>
                {t(`onboarding.details.conditions.${value}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={goNext} disabled={isSaving} className="mt-6 items-center rounded-2xl bg-ink py-4">
        <Text className="font-semi text-base text-white">{isSaving ? t('common.saving') : t('common.continue')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/onboarding/team')} className="mt-3 items-center">
        <Text className="font-semi text-sm text-muted">{t('common.skipStep')}</Text>
      </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
