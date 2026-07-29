import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ThemeProvider } from '@/hooks/useTheme'
import '@/index.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('No se encontró el contenedor #root.')
}

// Quita el estado de carga previo a React recién cuando hay algo que mostrar.
container.replaceChildren()

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
