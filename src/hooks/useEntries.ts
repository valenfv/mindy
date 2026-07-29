import { useLiveQuery } from 'dexie-react-hooks'
import { readEntries } from '@/db/entries'
import type { JournalEntry } from '@/models/journal'

export interface EntriesState {
  status: 'loading' | 'ready' | 'error'
  entries: JournalEntry[]
  corruptedCount: number
  errorMessage: string | null
}

/**
 * Entradas ordenadas de la más reciente a la más antigua.
 *
 * `useLiveQuery` vuelve a ejecutar la consulta cuando cambia la tabla, así el
 * historial se actualiza al guardar, completar o borrar sin recargar la página
 * ni mantener un store global.
 */
export function useEntries(): EntriesState {
  const result = useLiveQuery(async () => {
    try {
      const { entries, corruptedCount } = await readEntries()
      return { entries, corruptedCount, errorMessage: null }
    } catch (error) {
      return {
        entries: [] as JournalEntry[],
        corruptedCount: 0,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'No pudimos leer las entradas guardadas en este dispositivo.',
      }
    }
  }, [])

  if (result === undefined) {
    return { status: 'loading', entries: [], corruptedCount: 0, errorMessage: null }
  }

  if (result.errorMessage) {
    return {
      status: 'error',
      entries: [],
      corruptedCount: 0,
      errorMessage: result.errorMessage,
    }
  }

  return {
    status: 'ready',
    entries: result.entries,
    corruptedCount: result.corruptedCount,
    errorMessage: null,
  }
}
