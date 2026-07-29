import type { EmotionId, JournalEntry } from '@/models/journal'

export interface EmotionOption {
  id: EmotionId
  label: string
}

export const EMOTIONS: readonly EmotionOption[] = [
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'miedo', label: 'Miedo' },
  { id: 'tristeza', label: 'Tristeza' },
  { id: 'enojo', label: 'Enojo' },
  { id: 'culpa', label: 'Culpa' },
  { id: 'verguenza', label: 'Vergüenza' },
  { id: 'frustracion', label: 'Frustración' },
  { id: 'soledad', label: 'Soledad' },
  { id: 'alegria', label: 'Alegría' },
  { id: 'alivio', label: 'Alivio' },
  { id: 'entusiasmo', label: 'Entusiasmo' },
  { id: 'otra', label: 'Otra' },
] as const

export const EMOTION_IDS = EMOTIONS.map((emotion) => emotion.id) as [EmotionId, ...EmotionId[]]

export function getEmotionLabel(id: EmotionId): string {
  return EMOTIONS.find((emotion) => emotion.id === id)?.label ?? id
}

type EmotionSource = Pick<JournalEntry, 'emotions' | 'customEmotion'>

/**
 * Etiquetas finales de las emociones de una entrada, en el orden en que se
 * guardaron. «Otra» se reemplaza por el nombre que escribió la persona.
 */
export function resolveEmotionLabels(entry: EmotionSource): string[] {
  return entry.emotions.map((id) => {
    if (id !== 'otra') return getEmotionLabel(id)
    const custom = entry.customEmotion?.trim()
    return custom && custom.length > 0 ? custom : 'Otra'
  })
}

/** Las mismas etiquetas en una sola línea, para el PDF y los textos corridos. */
export function formatEmotionLabels(entry: EmotionSource): string {
  return resolveEmotionLabels(entry).join(', ')
}

export const INTENSITY_REFERENCES: readonly { value: number; label: string }[] = [
  { value: 1, label: 'muy leve' },
  { value: 5, label: 'moderada' },
  { value: 10, label: 'muy intensa' },
] as const

/** Descripción textual de la intensidad, para no depender sólo del número. */
export function describeIntensity(intensity: number): string {
  if (intensity <= 2) return 'muy leve'
  if (intensity <= 4) return 'leve'
  if (intensity <= 6) return 'moderada'
  if (intensity <= 8) return 'intensa'
  return 'muy intensa'
}
