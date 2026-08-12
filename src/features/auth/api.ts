import { get, post } from '@/lib/api'
import { tokens } from '@/lib/tokens'
import type { Tokens, User } from '@/lib/types'

export const authApi = {
  login: (email: string, password: string) =>
    post<Tokens>('/api/auth/login', { email, password }),

  profile: () => get<User>('/api/users/profile'),

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
 * Rolni token ichidan o'qish mumkin edi, lekin `GET /api/users/profile`
 * ishonchliroq — bazadagi haqiqiy holatni beradi.
 */
export async function login(email: string, password: string): Promise<User> {
  let issued: Tokens

  try {
    issued = await authApi.login(email, password)
  } catch (error) {
    throw new LoginError(classify(error))
  }

  tokens.save(issued.access_token, issued.refresh_token)

  let me: User
  try {
    me = await authApi.profile()
  } catch (error) {
    tokens.clear()
    throw new LoginError(classify(error))
  }

  if (me.role !== 'ADMIN') {
    tokens.clear()
    throw new LoginError('notAdmin')
  }

  return me
}
