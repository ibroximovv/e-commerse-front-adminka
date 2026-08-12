import { Avatar, AvatarFallback, AvatarImage } from 'dgz-ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'dgz-ui/dropdown'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/auth/hooks'
import { fileUrl } from '@/lib/api'
import type { User } from '@/lib/types'
import { initials } from '@/lib/utils'

export function UserMenu({ user }: { user?: User }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-accent"
          aria-label={t('nav.profile')}
        >
          <Avatar className="size-8">
            <AvatarImage src={fileUrl(user?.photo)} alt="" />
            <AvatarFallback className="bg-brand-muted text-xs font-medium text-brand">
              {initials(user?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.full_name || t('role.ADMIN')}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
          <UserIcon className="size-4" aria-hidden />
          {t('nav.profile')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
          <LogOut className="size-4" aria-hidden />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
