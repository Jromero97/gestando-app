import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WizardHeader } from '../components/WizardHeader';
import { useAuthStore } from '../store/useAuthStore';
import { updateMe } from '../services/usersService';
import { getApiErrorMessage } from '../services/apiError';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3001';

const STRENGTH_KEYS = ['tooShort', 'weak', 'medium', 'strong'] as const;

function passwordStrengthScore(password: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (password.length >= 12 || /[^a-zA-Z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strengthScore = passwordStrengthScore(password);
  const canContinue =
    fullName.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && acceptedPrivacyPolicy;

  async function handleContinue() {
    if (!canContinue) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await register(email.trim(), password, acceptedPrivacyPolicy);

      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      await updateMe({ firstName, lastName: rest.join(' ') || undefined });

      // No explicit navigation here: register() just set token +
      // onboardingStatus, which flips the root Stack.Protected guard to the
      // onboarding branch on its own, and onboarding/index.tsx redirects to
      // /onboarding/dating as soon as it mounts. Navigating here too raced
      // that automatic redirect and caused dating.tsx to flash/remount twice.
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
        <WizardHeader step={1} totalSteps={4} onBack={() => router.replace('/login')} />

      <Text className="mt-6 font-display text-2xl text-ink">{t('signup.title')}</Text>
      <Text className="mt-1 font-semi text-sm text-muted">{t('signup.subtitle')}</Text>

      <Text className="mb-1 mt-6 font-semi text-xs uppercase text-muted">{t('signup.name')}</Text>
      <TextInput
        className="rounded-2xl border border-neutral-200 bg-surface px-4 py-3 font-sans text-base"
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('signup.namePlaceholder')}
        accessibilityLabel={t('signup.name')}
      />

      <Text className="mb-1 mt-4 font-semi text-xs uppercase text-muted">{t('signup.email')}</Text>
      <TextInput
        className="rounded-2xl border border-neutral-200 bg-surface px-4 py-3 font-sans text-base"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel={t('signup.email')}
      />

      <Text className="mb-1 mt-4 font-semi text-xs uppercase text-muted">{t('signup.password')}</Text>
      <TextInput
        className="rounded-2xl border border-neutral-200 bg-surface px-4 py-3 font-sans text-base"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel={t('signup.password')}
      />
      {password.length > 0 && (
        <View className="mt-2">
          <View className="flex-row gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < strengthScore ? 'bg-primary' : 'bg-rose'}`}
              />
            ))}
          </View>
          <Text className="mt-1 text-right font-semi text-xs text-muted">
            {t(`signup.passwordStrength.${STRENGTH_KEYS[strengthScore]}`)}
          </Text>
        </View>
      )}

      {error && <Text className="mt-3 font-semi text-sm text-red-400">{error}</Text>}

      <TouchableOpacity
        onPress={() => setAcceptedPrivacyPolicy((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedPrivacyPolicy }}
        accessibilityLabel={`${t('signup.privacyConsentPrefix')}${t('signup.privacyConsentLink')}`}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        className="mt-6 flex-row items-center gap-2"
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded ${acceptedPrivacyPolicy ? 'bg-primary' : 'border border-neutral-300'}`}
        >
          {acceptedPrivacyPolicy && <Ionicons name="checkmark" size={14} color="#2B2A33" />}
        </View>
        <Text className="flex-1 font-semi text-xs text-muted">
          {t('signup.privacyConsentPrefix')}
          <Text className="text-primary" onPress={() => Linking.openURL(`${WEB_URL}/privacy`)}>
            {t('signup.privacyConsentLink')}
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={isSubmitting || !canContinue}
        className="mt-6 items-center rounded-2xl bg-ink py-4"
      >
        <Text className="font-semi text-base text-white">{isSubmitting ? t('common.oneMoment') : t('common.continue')}</Text>
      </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
