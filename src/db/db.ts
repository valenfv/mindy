import Dexie, { type Table } from 'dexie'
import type { JournalDraft, JournalEntry } from '@/models/journal'

export const DB_NAME = 'mindy'

/**
 * Convierte un registro con una sola emoción (`emotion`) al formato con varias
 * (`emotions`). Se usa en la migración a la versión 2.
 */
function migrateEmotionToEmotions(record: Record<string, unknown>): void {
  const legacy = record.emotion

  if (!Array.isArray(record.emotions)) {
    record.emotions = typeof legacy === 'string' && legacy.length > 0 ? [legacy] : []
  }

  delete record.emotion
}

/**
 * Base local. `createdAt` está indexado porque es el criterio de orden y de
 * filtrado por rango. `isOutcomeComplete` no se indexa: los booleanos no son
 * claves válidas en IndexedDB.
 */
export class MindyDatabase extends Dexie {
  entries!: Table<JournalEntry, string>
  drafts!: Table<JournalDraft, string>

  constructor(name: string = DB_NAME) {
    super(name)
    this.version(1).stores({
      entries: 'id, createdAt',
      drafts: 'id',
    })

    // v2: una entrada puede tener varias emociones. Los índices no cambian; la
    // migración sólo reescribe el contenido de cada registro, así nadie pierde
    // lo que ya tenía guardado en este dispositivo.
    this.version(2)
      .stores({
        entries: 'id, createdAt',
        drafts: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('entries')
          .toCollection()
          .modify((entry: Record<string, unknown>) => {
            migrateEmotionToEmotions(entry)
            entry.schemaVersion = 2
          })

        await tx
          .table('drafts')
          .toCollection()
          .modify((draft: Record<string, unknown>) => {
            if (typeof draft.values === 'object' && draft.values !== null) {
              migrateEmotionToEmotions(draft.values as Record<string, unknown>)
            }
            draft.schemaVersion = 2
          })
      })
  }
}

export const db = new MindyDatabase()

/** Error de almacenamiento con un mensaje entendible por cualquier persona. */
export class StorageError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'StorageError'
    this.cause = cause
  }
}

/**
 * Traduce fallas de IndexedDB a lenguaje humano. Los casos reales más comunes
 * son la cuota llena y la navegación privada, donde el almacenamiento puede
 * estar bloqueado por completo.
 */
export function toStorageError(error: unknown): StorageError {
  const name = error instanceof Error ? error.name : ''

  if (name === 'QuotaExceededError') {
    return new StorageError(
      'No queda espacio en este dispositivo para guardar más entradas. Probá liberar espacio y volvé a intentar.',
      error,
    )
  }

  if (name === 'InvalidStateError' || name === 'SecurityError' || name === 'UnknownError') {
    return new StorageError(
      'Tu navegador está bloqueando el almacenamiento local. Si estás en una ventana privada, probá en una ventana normal.',
      error,
    )
  }

  return new StorageError(
    'No pudimos acceder a los datos guardados en este dispositivo. Volvé a intentar en un momento.',
    error,
  )
}
