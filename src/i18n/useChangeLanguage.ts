import { useQueryClient } from '@tanstack/react-query'
import { setLanguage } from './index'
import type { Language } from '@/lib/types'

/**
 * Tilni almashtiradi va butun query keshini bekor qiladi.
 *
 * Backend `name`/`description` ni `?ln` bo'yicha tarjima qilib beradi, ya'ni
 * bir xil query kaliti ostidagi javob til bilan birga o'zgaradi. Keshni
 * tozalamasak, ekrandagi ro'yxatlar eski tilda qotib qoladi.
 */
export function useChangeLanguage() {
  const qc = useQueryClient()

  return (language: Language) => {
    setLanguage(language)
    void qc.invalidateQueries()
  }
}
