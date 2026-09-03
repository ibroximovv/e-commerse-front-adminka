import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi, type UserQueryParams } from './api'
import type { Role } from '@/lib/types'
import type { UserUpdateInput } from './types'

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => usersApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersApi.stats,
    staleTime: 60 * 1000,
  })
}

export function useUserMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['users'] })
    /* Buyurtmalar javobida `user` ichma-ich keladi — ism o'zgarsa u ham eskiradi. */
    void qc.invalidateQueries({ queryKey: ['orders'] })
    void qc.invalidateQueries({ queryKey: ['profile'] })
    void qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: UserUpdateInput }) =>
        usersApi.update(id, body),
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: ({ id, role }: { id: string; role: Role }) =>
        usersApi.updateRole(id, role),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => usersApi.remove(id),
      onSuccess: invalidate,
    }),
  }
}
