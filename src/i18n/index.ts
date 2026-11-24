import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import en from './locales/en.json';
import id from './locales/id.json';

export const LANGUAGE_STORAGE_KEY = 'klyro-language';
export const FALLBACK_LANGUAGE = 'id';

/** Stored preference → signed-in `user.language` → fallback. */
function initialLanguage(): string {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const fromUser = useAuthStore.getState().user?.language;
  return fromUser ?? stored ?? FALLBACK_LANGUAGE;
}

void i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: initialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => localStorage.setItem(LANGUAGE_STORAGE_KEY, lng));

// Keep the UI in sync when the signed-in user's saved preference arrives (login,
// `GET /auth/me`, or a `PATCH /auth/me` from another tab). A user without a saved
// preference falls back to `id`.
useAuthStore.subscribe((state, prev) => {
  const next = state.user ? (state.user.language ?? FALLBACK_LANGUAGE) : undefined;
  const before = prev.user ? (prev.user.language ?? FALLBACK_LANGUAGE) : undefined;
  if (next && next !== before && next !== i18n.language) {
    void i18n.changeLanguage(next);
  }
});

export default i18n;
