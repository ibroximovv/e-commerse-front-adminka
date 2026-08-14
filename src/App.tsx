import { BrowserRouter } from 'react-router-dom'
import { Providers } from './app/providers'
import { AppRoutes } from './app/router'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        {/* i18n `Providers` ichida init bo'ladi — boundary shundan keyin turishi kerak. */}
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Providers>
    </BrowserRouter>
  )
}
