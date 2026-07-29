import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { AppShell } from '@/components/layout/AppShell'
import { UpdatePrompt } from '@/components/layout/UpdatePrompt'
import { useTheme } from '@/hooks/useTheme'
import JournalPage from '@/pages/JournalPage'
import NotFoundPage from '@/pages/NotFoundPage'

// El journey es la pantalla de entrada; el historial se carga cuando se visita.
// El service worker precachea el chunk, así que sigue estando disponible offline.
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))

export function App() {
  const { resolved } = useTheme()

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<JournalPage />} />
          <Route
            path="/historial"
            element={
              <Suspense fallback={<LoadingScreen label="Buscando tus entradas…" />}>
                <HistoryPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Toaster
        theme={resolved}
        position="bottom-center"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'rounded-xl border border-border bg-card text-card-foreground shadow-lifted font-sans',
            description: 'text-muted-foreground',
            actionButton: 'rounded-full bg-primary text-primary-foreground',
          },
        }}
      />

      <UpdatePrompt />
    </>
  )
}
