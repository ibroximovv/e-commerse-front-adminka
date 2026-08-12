import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language } from '@/lib/types'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

/*
 * Bu — INTERFEYS tili. API so'rovlaridagi `ln` parametri bilan aralashtirmang:
 * u doim `en` bo'ladi (lib/api.ts ga qarang), aks holda backend `name`/
 * `description` maydonlarini tarjima qilib yuboradi va tahrirlashda ma'lumot
 * buziladi.
 */

export const LANGUAGES: Language[] = ['uz', 'ru', 'en']
export const DEFAULT_LANGUAGE: Language = 'uz'

const STORAGE_KEY = 'ui_language'

export function storedLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY)
  return LANGUAGES.includes(saved as Language) ? (saved as Language) : DEFAULT_LANGUAGE
}

export function setLanguage(language: Language) {
  localStorage.setItem(STORAGE_KEY, language)
  void i18n.changeLanguage(language)
  document.documentElement.lang = language
}

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: storedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
})

document.documentElement.lang = i18n.language

export default i18n
