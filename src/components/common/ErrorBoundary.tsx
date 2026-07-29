import { Component, type ErrorInfo, type ReactNode } from 'react'
import { MindyLogo } from '@/components/brand/MindyLogo'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Última red de contención. No reporta a ningún servicio externo: sólo deja el
 * detalle en la consola y ofrece recargar, aclarando que los datos siguen ahí.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mindy encontró un error inesperado:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="container flex min-h-screen-safe max-w-md flex-col items-center justify-center gap-5 text-center">
        <MindyLogo />
        <h1 className="text-xl font-semibold">Algo se interrumpió</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mindy no pudo seguir mostrando esta pantalla. Tus entradas siguen guardadas en este
          dispositivo: al volver a abrir la aplicación deberían estar todas.
        </p>
        <Button onClick={() => window.location.reload()}>Recargar Mindy</Button>
      </main>
    )
  }
}
