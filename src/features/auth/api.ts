import { ApiError, get, post } from '@/lib/api'
import { tokens } from '@/lib/tokens'
import type { AuthResponse, Tokens, User } from '@/lib/types'

export const authApi = {
  // Admins log in with phone + password; `full_name` is ignored for ADMIN.
  login: (phone: string, password: string) =>
    post<AuthResponse | Tokens>('/api/auth/login', { phone, password }),

  profile: () => get<User>('/api/users/profile'),

  logout: () => post<void>('/api/auth/logout'),

  changePassword: (old_password: string, new_password: string) =>
    post<void>('/api/auth/change-password', { old_password, new_password }),
}

/** Login rad etilishining aniq sababi — foydalanuvchiga to'g'ri xabar berish uchun. */
export type LoginFailure =
  | 'invalidCredentials'
  | 'tooManyAttempts'
  | 'notAdmin'
  | 'generic'

export class LoginError extends Error {
  reason: LoginFailure

  constructor(reason: LoginFailure) {
    super(reason)
    this.name = 'LoginError'
    this.reason = reason
  }
}

/*
 * Backend translates `message` by `?ln`, so matching English text breaks in
 * uz/ru. The status code is stable: 401 = wrong phone/password (deliberately
 * the same response whether the phone exists or not), 429 = 5 failures in
 * 15 min, 403 = not an ADMIN.
 */
function classify(error: unknown): LoginFailure {
  const status = error instanceof ApiError ? error.status : undefined

  if (status === 401) return 'invalidCredentials'
  if (status === 429) return 'tooManyAttempts'
  if (status === 403) return 'notAdmin'
  return 'generic'
}

/**
 * Kirish oqimi: token olish → profilni tekshirish → ADMIN emasligi aniqlansa
 * tokenlarni darhol tozalash.
 *
 * Backend endi login'da to'g'ridan-to'g'ri user obyektini qaytaradi.
 */
export async function login(phone: string, password: string): Promise<User> {
  let issued: AuthResponse | Tokens

  try {
    issued = await authApi.login(phone, password)
  } catch (error) {
    throw new LoginError(classify(error))
  }

  tokens.save(issued.access_token, issued.refresh_token)

  let me: User
  if ('user' in issued && issued.user) {
    me = issued.user
  } else {
    try {
      me = await authApi.profile()
    } catch (error) {
      tokens.clear()
      throw new LoginError(classify(error))
    }
  }

  if (me.role !== 'ADMIN') {
    tokens.clear()
    throw new LoginError('notAdmin')
  }

  return me
}
