import { Button } from 'dgz-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'dgz-ui/dropdown'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n'
import type { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * `onSelect` — tanlovni serverga ham yozish uchun (PATCH /api/users/profile).
 * Berilmasa faqat interfeys tili almashadi.
 */
export function LanguageSwitcher({
  value,
  onSelect,
}: {
  value: Language
  onSelect: (language: Language) => void
}) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" size="icon" aria-label={t('language.label')}>
          <Languages className="size-[1.2rem]" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => onSelect(language)}
            className="justify-between gap-3"
          >
            {t(`language.${language}`)}
            <Check
              className={cn(
                'size-4 text-brand',
                language === value ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
