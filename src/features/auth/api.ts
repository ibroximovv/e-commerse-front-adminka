import { get, post } from '@/lib/api'
import { tokens } from '@/lib/tokens'
import type { AuthResponse, Tokens, User } from '@/lib/types'

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse | Tokens>('/api/auth/login', { email, password }),

  profile: () => get<User>('/api/users/profile'),

  forgotPassword: (email: string) =>
    post<{ message?: string }>('/api/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, new_password: string) =>
    post<{ message?: string }>('/api/auth/reset-password', {
      email,
      code,
      new_password,
    }),

  logout: () => post<void>('/api/auth/logout'),

  changePassword: (old_password: string, new_password: string) =>
    post<void>('/api/auth/change-password', { old_password, new_password }),
}

/** Login rad etilishining aniq sababi — foydalanuvchiga to'g'ri xabar berish uchun. */
export type LoginFailure =
  | 'invalidCredentials'
  | 'notVerified'
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

function classify(error: unknown): LoginFailure {
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  if (message.includes('not verified')) return 'notVerified'
  if (message.includes('invalid credentials')) return 'invalidCredentials'
  if (message.includes('forbidden')) return 'notAdmin'
  return 'generic'
}

/**
 * Kirish oqimi: token olish → profilni tekshirish → ADMIN emasligi aniqlansa
 * tokenlarni darhol tozalash.
 *
 * Backend endi login'da to'g'ridan-to'g'ri user obyektini qaytaradi.
 */
export async function login(email: string, password: string): Promise<User> {
  let issued: AuthResponse | Tokens

  try {
    issued = await authApi.login(email, password)
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
