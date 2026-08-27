import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getToken, setToken } from '../services/tokenStorage';
import es from './locales/es.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'gestando_language';

function detectDeviceLanguage(): SupportedLanguage {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  return deviceLanguage === 'en' ? 'en' : 'es';
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

/** Applies a previously chosen language, if any, once secure storage has been read. */
export async function loadStoredLanguage(): Promise<void> {
  const stored = await getToken(LANGUAGE_STORAGE_KEY);
  if (stored === 'es' || stored === 'en') {
    await i18n.changeLanguage(stored);
  }
}

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  await setToken(LANGUAGE_STORAGE_KEY, language);
}

/** Locale string for Date#toLocaleDateString/toLocaleTimeString, matching the active language. */
export function currentDateLocale(): string {
  return i18n.language === 'en' ? 'en-US' : 'es-ES';
}

export default i18n;
