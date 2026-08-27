import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DatePickerField } from '../../components/DatePickerField';
import { PillToggle } from '../../components/PillToggle';
import { fetchProfile, upsertProfile } from '../../services/profileService';
import { fetchMe, updateMe } from '../../services/usersService';
import { getApiErrorMessage } from '../../services/apiError';
import { useAuthStore } from '../../store/useAuthStore';
import { setAppLanguage, SupportedLanguage } from '../../i18n';
import { CARD_SHADOW } from '../../constants/shadow';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const withdrawHealthDataConsent = useAuthStore((state) => state.withdrawHealthDataConsent);
  const refreshOnboardingStatus = useAuthStore((state) => state.refreshOnboardingStatus);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function cancelDeleteAccount() {
    setShowDeleteConfirm(false);
    setDeletePassword('');
    setDeleteError(null);
  }

  async function handleDeleteAccount() {
    if (!deletePassword) return;
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeletingAccount(false);
    }
  }

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  function cancelWithdraw() {
    setShowWithdrawConfirm(false);
    setWithdrawPassword('');
    setWithdrawError(null);
  }

  async function handleWithdrawHealthData() {
    if (!withdrawPassword) return;
    setIsWithdrawing(true);
    setWithdrawError(null);
    try {
      // On success, refreshOnboardingStatus() (inside the store) flips
      // onboardingStatus away from 'complete', so the root layout's
      // Stack.Protected guard navigates out of (tabs) into onboarding
      // almost immediately - no local "done" state needed here.
      await withdrawHealthDataConsent(withdrawPassword);
    } catch (err) {
      setWithdrawError(getApiErrorMessage(err));
    } finally {
      setIsWithdrawing(false);
    }
  }

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalMessage, setGeneralMessage] = useState<string | null>(null);

  const [dueDate, setDueDate] = useState(new Date());
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState<Date | null>(null);
  const [babyName, setBabyName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingPregnancy, setIsSavingPregnancy] = useState(false);
  const [pregnancyMessage, setPregnancyMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMe(), fetchProfile()])
      .then(([user, profile]) => {
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        setHeightCm(user.heightCm != null ? String(user.heightCm) : '');
        setWeightKg(user.prePregnancyWeightKg != null ? String(user.prePregnancyWeightKg) : '');

        if (profile) {
          setDueDate(new Date(profile.dueDate));
          setLastMenstrualPeriod(profile.lastMenstrualPeriod ? new Date(profile.lastMenstrualPeriod) : null);
          setBabyName(profile.babyName ?? '');
          setNotes(profile.notes ?? '');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSaveGeneral() {
    setIsSavingGeneral(true);
    setGeneralMessage(null);
    try {
      await updateMe({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        prePregnancyWeightKg: weightKg ? parseFloat(weightKg) : undefined,
      });
      await refreshOnboardingStatus();
      setGeneralMessage(t('common.saved'));
    } catch (err) {
      setGeneralMessage(getApiErrorMessage(err));
    } finally {
      setIsSavingGeneral(false);
    }
  }

  async function handleSavePregnancy() {
    setIsSavingPregnancy(true);
    setPregnancyMessage(null);
    try {
      await upsertProfile({
        dueDate: dueDate.toISOString(),
        lastMenstrualPeriod: lastMenstrualPeriod?.toISOString(),
        babyName: babyName || undefined,
        notes: notes || undefined,
      });
      setPregnancyMessage(t('common.saved'));
    } catch (err) {
      setPregnancyMessage(getApiErrorMessage(err));
    } finally {
      setIsSavingPregnancy(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#E28A96" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-5"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="mb-6 font-display text-2xl text-ink">{t('tabs.profile.title')}</Text>

      <Text className="mb-2 font-semi text-sm uppercase text-muted">{t('tabs.profile.language')}</Text>
      <View className="mb-2 rounded-card bg-surface p-3" style={CARD_SHADOW}>
        <PillToggle
          value={i18n.language === 'en' ? 'en' : 'es'}
          onChange={(lang) => {
            setAppLanguage(lang as SupportedLanguage);
            // Best-effort: push notification copy reads this server-side.
            // A failed sync shouldn't block the (purely local) language switch.
            updateMe({ preferredLocale: lang }).catch(() => {});
          }}
          options={[
            { value: 'es', label: t('tabs.profile.languageSpanish') },
            { value: 'en', label: t('tabs.profile.languageEnglish') },
          ]}
        />
      </View>

      <Text className="mb-2 mt-6 font-semi text-sm uppercase text-muted">{t('tabs.profile.generalSectionTitle')}</Text>
      <View className="rounded-card bg-surface p-5" style={CARD_SHADOW}>
        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.firstNameLabel')}</Text>
        <TextInput
          className="mb-4 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t('tabs.profile.firstNamePlaceholder')}
          accessibilityLabel={t('tabs.profile.firstNameLabel')}
        />

        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.lastNameLabel')}</Text>
        <TextInput
          className="mb-4 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={lastName}
          onChangeText={setLastName}
          placeholder={t('tabs.profile.lastNamePlaceholder')}
          accessibilityLabel={t('tabs.profile.lastNameLabel')}
        />

        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.heightLabel')}</Text>
        <TextInput
          className="mb-4 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="decimal-pad"
          placeholder={t('tabs.profile.heightPlaceholder')}
          accessibilityLabel={t('tabs.profile.heightLabel')}
        />

        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.weightLabel')}</Text>
        <TextInput
          className="rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="decimal-pad"
          placeholder={t('tabs.profile.weightPlaceholder')}
          accessibilityLabel={t('tabs.profile.weightLabel')}
        />
      </View>

      <TouchableOpacity
        onPress={handleSaveGeneral}
        disabled={isSavingGeneral}
        className="mt-4 items-center rounded-2xl bg-primary py-4"
      >
        <Text className="font-semi text-base text-ink">
          {isSavingGeneral ? t('common.saving') : t('tabs.profile.saveGeneral')}
        </Text>
      </TouchableOpacity>

      {generalMessage && <Text className="mt-2 text-center font-semi text-sm text-muted">{generalMessage}</Text>}

      <Text className="mb-2 mt-8 font-semi text-sm uppercase text-muted">{t('tabs.profile.pregnancySectionTitle')}</Text>
      <View className="rounded-card bg-surface p-5" style={CARD_SHADOW}>
        <DatePickerField label={t('tabs.profile.dueDateLabel')} value={dueDate} onChange={setDueDate} />
        <DatePickerField
          label={t('tabs.profile.lmpLabel')}
          value={lastMenstrualPeriod ?? new Date()}
          onChange={setLastMenstrualPeriod}
        />

        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.babyNameLabel')}</Text>
        <TextInput
          className="mb-4 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={babyName}
          onChangeText={setBabyName}
          placeholder={t('tabs.profile.babyNamePlaceholder')}
          accessibilityLabel={t('tabs.profile.babyNameLabel')}
        />

        <Text className="mb-1 font-semi text-sm text-muted">{t('tabs.profile.notesLabel')}</Text>
        <TextInput
          className="min-h-24 rounded-xl border border-neutral-200 bg-background px-4 py-3 font-sans text-base text-ink"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          accessibilityLabel={t('tabs.profile.notesLabel')}
        />
      </View>

      <TouchableOpacity
        onPress={handleSavePregnancy}
        disabled={isSavingPregnancy}
        className="mt-4 items-center rounded-2xl bg-primary py-4"
      >
        <Text className="font-semi text-base text-ink">
          {isSavingPregnancy ? t('common.saving') : t('tabs.profile.savePregnancy')}
        </Text>
      </TouchableOpacity>

      {pregnancyMessage && <Text className="mt-2 text-center font-semi text-sm text-muted">{pregnancyMessage}</Text>}

      <TouchableOpacity onPress={logout} className="mt-8 items-center">
        <Text className="font-semi text-sm text-muted">{t('tabs.profile.logout')}</Text>
      </TouchableOpacity>

      <View className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-4">
        <Text className="font-semi text-sm text-red-600">{t('tabs.profile.dangerZoneTitle')}</Text>

        {!showWithdrawConfirm ? (
          <TouchableOpacity onPress={() => setShowWithdrawConfirm(true)} className="mt-2">
            <Text className="font-semi text-sm text-red-500 underline">
              {t('tabs.profile.withdrawHealthData')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="mt-3">
            <Text className="font-semi text-xs text-red-500">{t('tabs.profile.withdrawHealthDataConfirm')}</Text>
            <TextInput
              className="mt-2 rounded-xl border border-red-200 bg-white px-3 py-2 font-sans text-sm"
              secureTextEntry
              placeholder={t('tabs.profile.deleteAccountPasswordPlaceholder')}
              accessibilityLabel={t('tabs.profile.deleteAccountPasswordPlaceholder')}
              value={withdrawPassword}
              onChangeText={setWithdrawPassword}
            />
            {withdrawError && <Text className="mt-1 font-semi text-xs text-red-600">{withdrawError}</Text>}
            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={cancelWithdraw}
                className="flex-1 items-center rounded-xl border border-neutral-300 py-2.5"
              >
                <Text className="font-semi text-sm text-ink">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWithdrawHealthData}
                disabled={isWithdrawing || !withdrawPassword}
                className="flex-1 items-center rounded-xl bg-red-600 py-2.5"
              >
                <Text className="font-semi text-sm text-white">
                  {isWithdrawing ? t('common.oneMoment') : t('tabs.profile.withdrawHealthDataButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mt-4 border-t border-red-100 pt-3">
        {!showDeleteConfirm ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} className="mt-2">
            <Text className="font-semi text-sm text-red-500 underline">{t('tabs.profile.deleteAccount')}</Text>
          </TouchableOpacity>
        ) : (
          <View className="mt-3">
            <Text className="font-semi text-xs text-red-500">{t('tabs.profile.deleteAccountConfirm')}</Text>
            <TextInput
              className="mt-2 rounded-xl border border-red-200 bg-white px-3 py-2 font-sans text-sm"
              secureTextEntry
              placeholder={t('tabs.profile.deleteAccountPasswordPlaceholder')}
              accessibilityLabel={t('tabs.profile.deleteAccountPasswordPlaceholder')}
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            {deleteError && <Text className="mt-1 font-semi text-xs text-red-600">{deleteError}</Text>}
            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={cancelDeleteAccount}
                className="flex-1 items-center rounded-xl border border-neutral-300 py-2.5"
              >
                <Text className="font-semi text-sm text-ink">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount || !deletePassword}
                className="flex-1 items-center rounded-xl bg-red-600 py-2.5"
              >
                <Text className="font-semi text-sm text-white">
                  {isDeletingAccount ? t('common.oneMoment') : t('tabs.profile.deleteAccountButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
