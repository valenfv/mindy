import { db, toStorageError } from '@/db/db'
import {
  CURRENT_SCHEMA_VERSION,
  DRAFT_ID,
  type JournalDraft,
  type JournalFormValues,
} from '@/models/journal'
import { EMOTION_IDS } from '@/lib/emotions'
import { TOTAL_STEPS } from '@/lib/questions'

export const EMPTY_FORM_VALUES: JournalFormValues = {
  situation: '',
  literalThought: '',
  feeling: '',
  emotion: '',
  customEmotion: '',
  intensity: 5,
  reaction: '',
  outcome: '',
}

/** `true` si el usuario efectivamente escribió algo que valga la pena guardar. */
export function isDraftMeaningful(values: JournalFormValues): boolean {
  return (
    values.situation.trim().length > 0 ||
    values.literalThought.trim().length > 0 ||
    values.feeling.trim().length > 0 ||
    values.reaction.trim().length > 0 ||
    values.outcome.trim().length > 0 ||
    values.customEmotion.trim().length > 0 ||
    values.emotion !== ''
  )
}

/**
 * Normaliza un borrador recuperado del disco. Si viene con forma inesperada se
 * completa con los valores vacíos en lugar de romper el formulario.
 */
function sanitizeValues(values: unknown): JournalFormValues {
  const source = (typeof values === 'object' && values !== null ? values : {}) as Record<
    string,
    unknown
  >

  const text = (key: keyof JournalFormValues): string =>
    typeof source[key] === 'string' ? (source[key] as string) : ''

  const emotion = source.emotion
  const validEmotion =
    typeof emotion === 'string' && (EMOTION_IDS as readonly string[]).includes(emotion)
      ? (emotion as JournalFormValues['emotion'])
      : ''

  const intensity = source.intensity
  const validIntensity =
    typeof intensity === 'number' && Number.isInteger(intensity) && intensity >= 1 && intensity <= 10
      ? intensity
      : EMPTY_FORM_VALUES.intensity

  return {
    situation: text('situation'),
    literalThought: text('literalThought'),
    feeling: text('feeling'),
    emotion: validEmotion,
    customEmotion: text('customEmotion'),
    intensity: validIntensity,
    reaction: text('reaction'),
    outcome: text('outcome'),
  }
}

function sanitizeStep(step: unknown): number {
  if (typeof step !== 'number' || !Number.isInteger(step)) return 1
  return Math.min(Math.max(step, 1), TOTAL_STEPS)
}

/**
 * Guarda el único borrador activo. Si el formulario quedó vacío, lo elimina en
 * lugar de conservar un borrador sin contenido.
 */
export async function saveDraft(values: JournalFormValues, step: number): Promise<void> {
  try {
    if (!isDraftMeaningful(values)) {
      await db.drafts.delete(DRAFT_ID)
      return
    }

    const draft: JournalDraft = {
      id: DRAFT_ID,
      updatedAt: new Date().toISOString(),
      step: sanitizeStep(step),
      values,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    }

    await db.drafts.put(draft)
  } catch (error) {
    throw toStorageError(error)
  }
}

export async function readDraft(): Promise<JournalDraft | undefined> {
  try {
    const draft = await db.drafts.get(DRAFT_ID)
    if (!draft) return undefined

    const values = sanitizeValues(draft.values)
    if (!isDraftMeaningful(values)) {
      await db.drafts.delete(DRAFT_ID)
      return undefined
    }

    return {
      id: DRAFT_ID,
      updatedAt: typeof draft.updatedAt === 'string' ? draft.updatedAt : new Date().toISOString(),
      step: sanitizeStep(draft.step),
      values,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    throw toStorageError(error)
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await db.drafts.delete(DRAFT_ID)
  } catch (error) {
    throw toStorageError(error)
  }
}
