import { db, toStorageError } from '@/db/db'
import { createId } from '@/lib/utils'
import {
  CURRENT_SCHEMA_VERSION,
  type EmotionIntensity,
  type JournalEntry,
  type JournalFormValues,
} from '@/models/journal'
import { storedEntrySchema } from '@/schemas/journal'

/** Regla de negocio incumplida; su mensaje ya es apto para mostrar al usuario. */
export class EntryRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EntryRuleError'
  }
}

export interface ReadEntriesResult {
  entries: JournalEntry[]
  /** Registros que no pasaron la validación de esquema, para poder avisarlo. */
  corruptedCount: number
}

function normalizeText(value: string): string {
  return value.trim()
}

/** Convierte los valores del formulario en una entrada lista para persistir. */
export function buildEntryFromForm(
  values: JournalFormValues,
  now: Date = new Date(),
): JournalEntry {
  if (values.emotions.length === 0) {
    throw new Error('No se puede crear una entrada sin ninguna emoción seleccionada.')
  }

  const timestamp = now.toISOString()
  const outcome = normalizeText(values.outcome)
  const customEmotion = normalizeText(values.customEmotion)

  return {
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    situation: normalizeText(values.situation),
    literalThought: normalizeText(values.literalThought),
    feeling: normalizeText(values.feeling),
    emotions: [...values.emotions],
    ...(values.emotions.includes('otra') && customEmotion.length > 0
      ? { customEmotion }
      : {}),
    intensity: values.intensity as EmotionIntensity,
    reaction: normalizeText(values.reaction),
    ...(outcome.length > 0 ? { outcome } : {}),
    isOutcomeComplete: outcome.length > 0,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }
}

export async function createEntry(
  values: JournalFormValues,
  now: Date = new Date(),
): Promise<JournalEntry> {
  const entry = buildEntryFromForm(values, now)
  try {
    await db.entries.add(entry)
    return entry
  } catch (error) {
    throw toStorageError(error)
  }
}

/**
 * Lee todas las entradas de la más reciente a la más antigua, descartando los
 * registros corruptos en lugar de fallar por completo.
 */
export async function readEntries(): Promise<ReadEntriesResult> {
  try {
    // Se leen todos los registros y se ordena en memoria a propósito: una
    // consulta por el índice `createdAt` omitiría los registros que no tengan
    // ese campo, y son justamente los que hay que detectar y avisar.
    const raw = await db.entries.toArray()
    const entries: JournalEntry[] = []
    let corruptedCount = 0

    for (const record of raw) {
      const parsed = storedEntrySchema.safeParse(record)
      if (parsed.success) {
        entries.push(parsed.data as JournalEntry)
      } else {
        corruptedCount += 1
      }
    }

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return { entries, corruptedCount }
  } catch (error) {
    throw toStorageError(error)
  }
}

export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  try {
    return await db.entries.get(id)
  } catch (error) {
    throw toStorageError(error)
  }
}

/**
 * Una entrada sólo se puede editar mientras «¿Qué pasó después?» siga
 * pendiente. Una vez completada queda en modo lectura.
 */
export function canCompleteOutcome(
  entry: Pick<JournalEntry, 'isOutcomeComplete'>,
): boolean {
  return !entry.isOutcomeComplete
}

export async function completeOutcome(
  id: string,
  outcome: string,
  now: Date = new Date(),
): Promise<JournalEntry> {
  const trimmed = normalizeText(outcome)
  if (trimmed.length === 0) {
    throw new EntryRuleError('No se puede completar una entrada con una respuesta vacía.')
  }

  try {
    return await db.transaction('rw', db.entries, async () => {
      const entry = await db.entries.get(id)
      if (!entry) {
        throw new EntryRuleError('Esta entrada ya no está disponible en este dispositivo.')
      }
      if (!canCompleteOutcome(entry)) {
        throw new EntryRuleError('Esta entrada ya está completa y no se puede modificar.')
      }

      const updated: JournalEntry = {
        ...entry,
        outcome: trimmed,
        isOutcomeComplete: true,
        updatedAt: now.toISOString(),
      }

      await db.entries.put(updated)
      return updated
    })
  } catch (error) {
    // Las reglas de negocio ya traen su propio mensaje; el resto se traduce.
    if (error instanceof EntryRuleError) throw error
    throw toStorageError(error)
  }
}

export async function deleteEntry(id: string): Promise<void> {
  try {
    await db.entries.delete(id)
  } catch (error) {
    throw toStorageError(error)
  }
}

/** Borra absolutamente todo lo guardado en este dispositivo. Irreversible. */
export async function deleteAllLocalData(): Promise<void> {
  try {
    await db.transaction('rw', db.entries, db.drafts, async () => {
      await db.entries.clear()
      await db.drafts.clear()
    })
  } catch (error) {
    throw toStorageError(error)
  }
}
