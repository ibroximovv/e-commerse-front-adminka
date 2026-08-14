import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './api'
import type { UserUpdateInput } from './types'

export function useUsers() {
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: usersApi.list,
    placeholderData: (prev) => prev,
  })
}

export function useUserMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['users'] })
    /* Buyurtmalar javobida `user` ichma-ich keladi — ism o'zgarsa u ham eskiradi. */
    void qc.invalidateQueries({ queryKey: ['orders'] })
    void qc.invalidateQueries({ queryKey: ['profile'] })
  }

  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: UserUpdateInput }) =>
        usersApi.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => usersApi.remove(id),
      onSuccess: invalidate,
    }),
  }
}
