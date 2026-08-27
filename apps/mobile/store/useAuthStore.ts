import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getToken, setToken, deleteToken } from '../services/tokenStorage';
import { setAuthToken } from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { login as loginRequest, register as registerRequest } from '../services/authService';
import { fetchMe, deleteMe, withdrawHealthDataConsent as withdrawHealthDataConsentRequest } from '../services/usersService';
import { fetchProfile } from '../services/profileService';
import { registerPushToken, removePushToken } from '../services/notificationsService';
import { decodeJwtPayload } from '../utils/jwt';

const TOKEN_KEY = 'gestando_access_token';

let cachedPushToken: string | null = null;

/**
 * Best-effort: a denied permission, a simulator with no push capability, or
 * a network hiccup must never block login/hydrate. Caches the Expo token so
 * logout() can unregister the exact same one.
 */
async function registerPush(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    cachedPushToken = token;
    await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch {
    // Registration is a nice-to-have, not a login/hydrate blocker.
  }
}

export type OnboardingStatus = 'unknown' | 'needs-general' | 'needs-pregnancy' | 'complete';

interface AuthState {
  token: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  onboardingStatus: OnboardingStatus;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    acceptedPrivacyPolicy: boolean,
    consentedToHealthData: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  withdrawHealthDataConsent: (password: string) => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

function emailFromToken(token: string): string | null {
  return decodeJwtPayload<{ email?: string }>(token)?.email ?? null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  email: null,
  firstName: null,
  lastName: null,
  onboardingStatus: 'unknown',
  isHydrated: false,
  error: null,

  hydrate: async () => {
    const token = await getToken(TOKEN_KEY);
    if (token) setAuthToken(token);
    set({ token, email: token ? emailFromToken(token) : null, isHydrated: true });
    if (token) {
      try {
        await get().refreshOnboardingStatus();
        await registerPush();
      } catch {
        // Token no longer resolves to a valid user (expired, revoked, or the
        // account was deleted) - treat it the same as a normal logout instead
        // of leaving the app stuck on the loading spinner.
        await get().logout();
      }
    }
  },

  login: async (email, password, rememberMe = true) => {
    set({ error: null });
    try {
      const token = await loginRequest(email, password);
      if (rememberMe) {
        await setToken(TOKEN_KEY, token);
      }
      setAuthToken(token);
      set({ token, email: emailFromToken(token) });
      await get().refreshOnboardingStatus();
      await registerPush();
    } catch (err) {
      set({ error: getApiErrorMessage(err) });
      throw new Error('login_failed');
    }
  },

  register: async (email, password, acceptedPrivacyPolicy, consentedToHealthData) => {
    set({ error: null });
    try {
      const token = await registerRequest(email, password, acceptedPrivacyPolicy, consentedToHealthData);
      await setToken(TOKEN_KEY, token);
      setAuthToken(token);
      set({ token, email: emailFromToken(token), onboardingStatus: 'needs-general' });
      await registerPush();
    } catch (err) {
      set({ error: getApiErrorMessage(err) });
      throw new Error('register_failed');
    }
  },

  logout: async () => {
    if (cachedPushToken) {
      try {
        await removePushToken(cachedPushToken);
      } catch {
        // Best-effort - a logged-out device that still gets one stray push
        // is harmless, but a failed unregister must never block logout.
      }
      cachedPushToken = null;
    }
    await deleteToken(TOKEN_KEY);
    setAuthToken(null);
    set({ token: null, email: null, firstName: null, lastName: null, onboardingStatus: 'unknown' });
  },

  deleteAccount: async (password) => {
    await deleteMe(password);
    await deleteToken(TOKEN_KEY);
    setAuthToken(null);
    cachedPushToken = null;
    set({ token: null, email: null, firstName: null, lastName: null, onboardingStatus: 'unknown' });
  },

  withdrawHealthDataConsent: async (password) => {
    await withdrawHealthDataConsentRequest(password);
    // Account/login stay intact - just re-evaluate onboarding status now
    // that the pregnancy profile (and everything else) is gone. That
    // naturally routes back to onboarding, same as a brand-new account.
    await get().refreshOnboardingStatus();
  },

  refreshOnboardingStatus: async () => {
    const [user, pregnancyProfile] = await Promise.all([fetchMe(), fetchProfile()]);
    const status: OnboardingStatus = !user.firstName
      ? 'needs-general'
      : !pregnancyProfile
        ? 'needs-pregnancy'
        : 'complete';
    set({ firstName: user.firstName ?? null, lastName: user.lastName ?? null, onboardingStatus: status });
  },
}));
