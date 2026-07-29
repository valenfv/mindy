import { NotebookPen, PenLine } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MindyLogo } from '@/components/brand/MindyLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const JOURNAL_LINK = {
  to: '/',
  icon: PenLine,
  long: 'Registrar experiencia',
  short: 'Registrar',
} as const

const HISTORY_LINK = {
  to: '/historial',
  icon: NotebookPen,
  long: 'Ver historial',
  short: 'Historial',
} as const

/**
 * Navbar sobrio y responsive. El CTA primario siempre apunta al lado donde la
 * persona NO está, así desde el historial la salida de vuelta al journey es
 * obvia; el link fantasma queda como indicador de sección actual en desktop.
 */
export function Navbar() {
  const { pathname } = useLocation()
  const isHistory = pathname === '/historial'
  const cta = isHistory ? JOURNAL_LINK : HISTORY_LINK
  const current = isHistory ? HISTORY_LINK : JOURNAL_LINK
  const CtaIcon = cta.icon
  const CurrentIcon = current.icon

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md pt-safe">
      <nav
        aria-label="Navegación principal"
        className="container flex h-16 items-center justify-between gap-3"
      >
        <Link
          to="/"
          className="rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Mindy, ir a registrar una experiencia"
        >
          <MindyLogo />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <NavLink
            to={current.to}
            end
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden text-muted-foreground sm:inline-flex',
                isActive && 'bg-secondary/70 text-foreground',
              )
            }
          >
            <CurrentIcon aria-hidden="true" />
            {current.short}
          </NavLink>

          <ThemeToggle />

          <Link to={cta.to} className={cn(buttonVariants({ size: 'sm' }), 'px-3.5 sm:px-4')}>
            <CtaIcon aria-hidden="true" />
            <span className="hidden sm:inline">{cta.long}</span>
            <span className="sm:hidden">{cta.short}</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
