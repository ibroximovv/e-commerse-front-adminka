import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { setApiLanguage } from '@/lib/api'
import type { Language } from '@/lib/types'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

/*
 * Interfeys tili VA API `?ln` parametri endi bitta manbadan boshqariladi:
 * backend tarjimani bazadan beradi, ya'ni ro'yxatlar foydalanuvchi tilida
 * keladi. Tahrirlash formalari buni chetlab o'tadi — ular `?raw=true` bilan
 * uchala tilni oladi (`lib/api.ts` dagi `getRaw`).
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
  setApiLanguage(language)
  void i18n.changeLanguage(language)
  document.documentElement.lang = language
}

setApiLanguage(storedLanguage())

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
