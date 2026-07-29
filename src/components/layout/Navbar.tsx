import { NotebookPen, PenLine } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { MindyLogo } from '@/components/brand/MindyLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Navbar sobrio y responsive. En mobile el CTA al historial conserva icono +
 * texto corto para que siga siendo obvio dónde encontrarlo.
 */
export function Navbar() {
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
            to="/"
            end
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden text-muted-foreground sm:inline-flex',
                isActive && 'bg-secondary/70 text-foreground',
              )
            }
          >
            <PenLine aria-hidden="true" />
            Registrar
          </NavLink>

          <ThemeToggle />

          <NavLink
            to="/historial"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? 'secondary' : 'default', size: 'sm' }),
                'px-3.5 sm:px-4',
              )
            }
          >
            <NotebookPen aria-hidden="true" />
            <span className="hidden sm:inline">Ver historial</span>
            <span className="sm:hidden">Historial</span>
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
