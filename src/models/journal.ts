/**
 * Versión del esquema persistido. Permite migraciones futuras sin ambigüedad.
 *
 * v2: `emotion` (una sola emoción) pasó a ser `emotions` (varias). La migración
 * vive en `MindyDatabase`.
 */
export const CURRENT_SCHEMA_VERSION = 2

export type EmotionIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/** Identificadores estables de emoción; las etiquetas visibles viven aparte. */
export type EmotionId =
  | 'ansiedad'
  | 'miedo'
  | 'tristeza'
  | 'enojo'
  | 'culpa'
  | 'verguenza'
  | 'frustracion'
  | 'soledad'
  | 'alegria'
  | 'alivio'
  | 'entusiasmo'
  | 'otra'

export interface JournalEntry {
  id: string
  /** ISO 8601, siempre en UTC. Se muestra con el formato local del usuario. */
  createdAt: string
  updatedAt: string
  situation: string
  literalThought: string
  feeling: string
  /** Al menos una; se guardan en el orden de la lista de emociones. */
  emotions: EmotionId[]
  /** Sólo se usa cuando `emotions` incluye `otra`. */
  customEmotion?: string
  intensity: EmotionIntensity
  reaction: string
  outcome?: string
  /** `false` mientras «¿Qué pasó después?» siga pendiente. */
  isOutcomeComplete: boolean
  schemaVersion: number
}

/** Valores que maneja el formulario por pasos, antes de convertirse en entrada. */
export interface JournalFormValues {
  situation: string
  literalThought: string
  feeling: string
  emotions: EmotionId[]
  customEmotion: string
  intensity: number
  reaction: string
  outcome: string
}

/** Único borrador activo en curso. */
export interface JournalDraft {
  id: 'active'
  updatedAt: string
  /** Paso en el que estaba el usuario, 1-indexado. */
  step: number
  values: JournalFormValues
  schemaVersion: number
}

export const DRAFT_ID = 'active' as const
