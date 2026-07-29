import { TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { ErrorState } from '@/components/common/ErrorState'
import { DangerZone } from '@/components/history/DangerZone'
import { EmptyHistory } from '@/components/history/EmptyHistory'
import { EntryCard } from '@/components/history/EntryCard'
import { ExportPanel } from '@/components/history/ExportPanel'
import { HistoryPagination } from '@/components/history/HistoryPagination'
import { PrivacyNote } from '@/components/layout/PrivacyNote'
import { Card } from '@/components/ui/card'
import { useEntries } from '@/hooks/useEntries'

/** Entradas por página del historial. */
const PAGE_SIZE = 10

export default function HistoryPage() {
  const { status, entries, corruptedCount, errorMessage } = useEntries()
  const [page, setPage] = useState(1)
  const listHeadingRef = useRef<HTMLHeadingElement>(null)
  // Sólo movemos el foco cuando el cambio de página lo pidió la persona.
  const focusListOnRender = useRef(false)

  useEffect(() => {
    document.title = 'Mindy · Historial'
  }, [])

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  // Si se borran entradas y la página actual queda vacía, mostramos la última.
  const currentPage = Math.min(page, totalPages)
  const firstIndex = (currentPage - 1) * PAGE_SIZE
  const visibleEntries = entries.slice(firstIndex, firstIndex + PAGE_SIZE)

  const goToPage = useCallback(
    (next: number) => {
      focusListOnRender.current = true
      setPage(Math.min(Math.max(next, 1), totalPages))
    },
    [totalPages],
  )

  useEffect(() => {
    if (!focusListOnRender.current) return
    focusListOnRender.current = false
    listHeadingRef.current?.focus()
    listHeadingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [currentPage])

  if (status === 'loading') {
    return (
      <main className="container max-w-3xl py-6 sm:py-10">
        <LoadingScreen label="Buscando tus entradas…" />
      </main>
    )
  }

  return (
    <main className="container max-w-3xl space-y-6 py-6 sm:py-10">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold sm:text-3xl">Tu historial</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {status === 'ready' && entries.length > 0
            ? `${entries.length === 1 ? '1 entrada registrada' : `${entries.length} entradas registradas`}, de la más reciente a la más antigua.`
            : 'Acá vas a ver todo lo que registres, de la más reciente a la más antigua.'}
        </p>
      </header>

      {status === 'error' ? (
        <ErrorState
          title="No pudimos abrir tu historial"
          description={
            <>
              <p>{errorMessage}</p>
              <p className="mt-2">
                Tus entradas no se borraron: siguen guardadas en este dispositivo.
              </p>
            </>
          }
          onRetry={() => window.location.reload()}
        />
      ) : null}

      {status === 'ready' && corruptedCount > 0 ? (
        <Card className="border-accent/30 bg-accent-soft/50 p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-accent-strong">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {corruptedCount === 1
                ? 'Hay 1 registro guardado que no pudimos leer'
                : `Hay ${corruptedCount} registros guardados que no pudimos leer`}
              , así que no se muestra en la lista ni se incluye en el PDF. El resto de tus entradas
              está intacto.
            </span>
          </p>
        </Card>
      ) : null}

      {status === 'ready' && entries.length === 0 ? <EmptyHistory /> : null}

      {status === 'ready' && entries.length > 0 ? (
        <>
          <section aria-label="Exportación">
            <ExportPanel entries={entries} />
          </section>

          <section aria-labelledby="history-list-heading" className="space-y-4">
            <h2
              id="history-list-heading"
              ref={listHeadingRef}
              tabIndex={-1}
              className="text-base font-semibold"
            >
              Entradas registradas
              {totalPages > 1 ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  Página <span className="tabular-nums">{currentPage}</span> de{' '}
                  <span className="tabular-nums">{totalPages}</span>
                </span>
              ) : null}
            </h2>

            <ul className="space-y-4">
              {visibleEntries.map((entry) => (
                <li key={entry.id}>
                  <EntryCard entry={entry} />
                </li>
              ))}
            </ul>

            <HistoryPagination
              page={currentPage}
              totalPages={totalPages}
              from={firstIndex + 1}
              to={firstIndex + visibleEntries.length}
              total={entries.length}
              onPageChange={goToPage}
            />
          </section>

          <section aria-label="Privacidad y datos">
            <DangerZone entryCount={entries.length} />
          </section>
        </>
      ) : null}

      <PrivacyNote className="pt-2" />
    </main>
  )
}
