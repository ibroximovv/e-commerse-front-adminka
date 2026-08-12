import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeMode } from 'dgz-ui-shared/enums'
import { ThemeProvider } from 'dgz-ui-shared/providers'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContainer } from 'react-toastify'
import '@/i18n'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /*
         * 401 ni `lib/api.ts` interceptori refresh bilan hal qiladi; refresh
         * ham yiqilsa qayta urinishning ma'nosi yo'q.
         */
        retry: (failureCount, error) =>
          error instanceof Error && error.message === 'SESSION_EXPIRED'
            ? false
            : failureCount < 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={ThemeMode.SYSTEM} storageKey="theme">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          newestOnTop
          closeOnClick
          theme="colored"
          aria-label="Notifications"
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
