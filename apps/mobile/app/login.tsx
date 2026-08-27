import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    try {
      await login(email.trim(), password, rememberMe);
    } catch {
      // the error is already in the store and rendered below
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center p-6"
      >
      <Image
        source={require('../assets/logo-mark.png')}
        accessible
        accessibilityLabel="GestandoApp"
        className="mb-6 h-16 w-16 rounded-3xl"
        resizeMode="cover"
      />

      <Text className="font-display text-3xl text-ink">{t('login.title')}</Text>
      <Text className="mt-2 font-semi text-base text-muted">{t('login.subtitle')}</Text>

      <Text className="mb-1 mt-8 font-semi text-xs uppercase text-muted">{t('login.email')}</Text>
      <TextInput
        className="rounded-2xl border border-neutral-200 bg-surface px-4 py-3 font-sans text-base"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel={t('login.email')}
        value={email}
        onChangeText={setEmail}
      />

      <Text className="mb-1 mt-4 font-semi text-xs uppercase text-muted">{t('login.password')}</Text>
      <View className="flex-row items-center rounded-2xl border border-neutral-200 bg-surface px-4 py-3">
        <TextInput
          className="flex-1 font-sans text-base"
          secureTextEntry={!showPassword}
          accessibilityLabel={t('login.password')}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
          <Text className="font-semi text-sm text-primary">
            {showPassword ? t('login.hidePassword') : t('login.showPassword')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setRememberMe((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
          accessibilityLabel={t('login.rememberMe')}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          className="flex-row items-center gap-2"
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded ${rememberMe ? 'bg-primary' : 'border border-neutral-300'}`}
          >
            {rememberMe && <Ionicons name="checkmark" size={14} color="#2B2A33" />}
          </View>
          <Text className="font-semi text-sm text-ink">{t('login.rememberMe')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert(t('login.forgotPasswordAlertTitle'), t('login.forgotPasswordAlertBody'))}
        >
          <Text className="font-semi text-sm text-primary">{t('login.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>

      {error && <Text className="mt-3 font-semi text-sm text-red-400">{error}</Text>}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting || !email.trim() || !password}
        className="mt-6 items-center rounded-2xl bg-ink py-4"
      >
        <Text className="font-semi text-base text-white">{isSubmitting ? t('common.oneMoment') : t('login.submit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')} className="mt-6 items-center">
        <Text className="font-semi text-sm text-muted">
          {t('login.noAccount')} <Text className="text-primary">{t('login.createAccount')}</Text>
        </Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
