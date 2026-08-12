import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, login } from './api'
import { tokens } from '@/lib/tokens'
import type { User } from '@/lib/types'

export const PROFILE_KEY = ['profile'] as const

/**
 * Joriy admin. Token bo'lmasa umuman so'rov yubormaydi — login sahifasida
 * keraksiz 401 chiqmasligi uchun.
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: authApi.profile,
    enabled: tokens.exists(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (user: User) => {
      qc.setQueryData(PROFILE_KEY, user)
      navigate('/', { replace: true })
    },
  })
}

/** Backend'da logout endpointi yo'q — tokenlar stateless. */
export function useLogout() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return () => {
    tokens.clear()
    qc.clear()
    navigate('/login', { replace: true })
  }
}
