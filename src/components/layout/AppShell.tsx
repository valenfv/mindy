import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { OfflineBanner } from '@/components/layout/OfflineBanner'

/** Estructura común a todas las pantallas. */
export function AppShell() {
  return (
    <div className="flex min-h-screen-safe flex-col px-safe">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <OfflineBanner />
      <Navbar />

      <div id="contenido" className="flex-1 pb-safe">
        <Outlet />
      </div>

      <footer className="border-t border-border/60 py-6 pb-safe">
        <p className="container text-center text-xs leading-relaxed text-muted-foreground">
          Mindy funciona sin cuenta y sin conexión. No hay analítica, seguimiento ni envío de datos a
          ningún servidor.
        </p>
      </footer>
    </div>
  )
}
