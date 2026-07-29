import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { ErrorState } from '@/components/common/ErrorState'
import { DangerZone } from '@/components/history/DangerZone'
import { EmptyHistory } from '@/components/history/EmptyHistory'
import { EntryCard } from '@/components/history/EntryCard'
import { ExportPanel } from '@/components/history/ExportPanel'
import { PrivacyNote } from '@/components/layout/PrivacyNote'
import { Card } from '@/components/ui/card'
import { useEntries } from '@/hooks/useEntries'

export default function HistoryPage() {
  const { status, entries, corruptedCount, errorMessage } = useEntries()

  useEffect(() => {
    document.title = 'Mindy · Historial'
  }, [])

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
          <section aria-label="Entradas registradas">
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <EntryCard entry={entry} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Exportación" className="pt-2">
            <ExportPanel entries={entries} />
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
