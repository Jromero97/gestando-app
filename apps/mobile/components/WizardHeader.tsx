import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  step: number;
  totalSteps: number;
  /** Optional: override the back action. Omit to use the safe default (see handleBack). */
  onBack?: () => void;
}

export function WizardHeader({ step, totalSteps, onBack }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  async function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    // Steps reached via router.replace() (right after signup, or resuming
    // mid-wizard) have no screen to go back to in this stack. Treat "back"
    // as leaving the wizard: log out. The root layout's Stack.Protected guard
    // reacts to the token change and swaps to the login branch on its own -
    // an explicit router.replace() here would race that unmount.
    await logout();
  }

  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        className="h-11 w-11 items-center justify-center rounded-full bg-surface"
      >
        <Ionicons name="chevron-back" size={20} color="#2B2A33" />
      </TouchableOpacity>
      <View className="flex-1 flex-row gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-rose'}`} />
        ))}
      </View>
      <Text className="font-semi text-sm text-muted">{t('wizardHeader.stepOf', { step, totalSteps })}</Text>
    </View>
  );
}
