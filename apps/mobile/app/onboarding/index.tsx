import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

/**
 * Entry point for the token-protected part of the wizard (steps 2-4).
 * Steps 2-4 only persist to the backend on the final submit (step 4), so
 * there's nothing server-side to resume mid-way - always start at step 2.
 */
export default function OnboardingIndexScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/dating');
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#E28A96" size="large" />
    </View>
  );
}
