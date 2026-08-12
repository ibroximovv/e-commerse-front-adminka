import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from './api'
import type { ProfileInput } from './api'
import { authApi } from '@/features/auth/api'
import { PROFILE_KEY } from '@/features/auth/hooks'
import type { User } from '@/lib/types'

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: ProfileInput) => profileApi.update(body),
    onSuccess: (user: User) => {
      qc.setQueryData(PROFILE_KEY, user)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      old_password,
      new_password,
    }: {
      old_password: string
      new_password: string
    }) => authApi.changePassword(old_password, new_password),
  })
}
