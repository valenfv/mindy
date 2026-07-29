import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HistoryPaginationProps {
  page: number
  totalPages: number
  /** Índices 1-based del primer y último elemento visible. */
  from: number
  to: number
  total: number
  onPageChange: (page: number) => void
}

/**
 * Paginación del historial. Muestra el rango visible en texto —así el estado no
 * depende sólo del número de página resaltado— y los números de página en
 * pantallas donde entran.
 */
export function HistoryPagination({
  page,
  totalPages,
  from,
  to,
  total,
  onPageChange,
}: HistoryPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav
      aria-label="Paginación del historial"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted-foreground" role="status">
        <span className="tabular-nums">
          {from}–{to}
        </span>{' '}
        de <span className="tabular-nums">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Button>

        <ul className="hidden items-center gap-1 sm:flex">
          {pages.map((value) => {
            const isCurrent = value === page

            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => onPageChange(value)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Página ${value} de ${totalPages}`}
                  className={cn(
                    'grid size-9 place-content-center rounded-full text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isCurrent
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )}
                >
                  {value}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="text-sm tabular-nums text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
