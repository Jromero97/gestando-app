import '../global.css';
import '../i18n';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useAuthStore } from '../store/useAuthStore';
import { loadStoredLanguage } from '../i18n';

export default function RootLayout() {
  const { isHydrated, token, onboardingStatus, hydrate } = useAuthStore();
  const [languageReady, setLanguageReady] = useState(false);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    hydrate();
    loadStoredLanguage().finally(() => setLanguageReady(true));

    // Tapping an appointment/exam reminder opens the Agenda tab. Deep-linking
    // to the specific item is out of scope for now - only registered once
    // for the app's lifetime, so it's here rather than inside a screen.
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      if (useAuthStore.getState().token) {
        router.push('/(tabs)/agenda');
      }
    });
    return () => subscription.remove();
  }, [hydrate, router]);

  const statusPending = !!token && onboardingStatus === 'unknown';

  if (!isHydrated || !fontsLoaded || !languageReady || statusPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#E28A96" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token && onboardingStatus === 'complete'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[date]" options={{ presentation: 'card' }} />
      </Stack.Protected>
      <Stack.Protected guard={!!token && onboardingStatus !== 'complete'}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
    </Stack>
  );
}
