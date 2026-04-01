import { Translations, Locale } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { uk } from './locales/uk';

export type { Translations, Locale };

const translations: Record<Locale, Translations> = { en, es, uk };

const LOCALE_KEY = 'schengen-locale';

let currentLocale: Locale = loadLocale();

function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved && saved in translations) return saved as Locale;
  } catch { /* ignore */ }
  return 'en';
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem(LOCALE_KEY, locale);
}

export function t(): Translations {
  return translations[currentLocale];
}

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'uk', label: 'UA' },
];