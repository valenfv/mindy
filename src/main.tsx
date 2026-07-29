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

// `window.mindyMock` para cargar datos de prueba. La condición es estática, así
// que el build de producción descarta la rama y el módulo no se incluye.
if (import.meta.env.DEV) {
  void import('@/dev/mockData').then(({ installMockDataTools }) => {
    installMockDataTools()
  })
}

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
