import type { JournalFormValues } from '@/models/journal'

/**
 * Campos que se validan al salir de cada paso, en el mismo orden que el
 * stepper. Se valida sólo lo del paso actual para no mostrar errores de
 * preguntas que la persona todavía no vio.
 */
export const STEP_FIELDS: readonly (readonly (keyof JournalFormValues)[])[] = [
  ['situation'],
  ['literalThought'],
  ['feeling', 'emotions', 'customEmotion', 'intensity'],
  ['reaction'],
  ['outcome'],
] as const

/** Campos del paso indicado (1-indexado). */
export function fieldsForStep(step: number): (keyof JournalFormValues)[] {
  return [...(STEP_FIELDS[step - 1] ?? [])]
}
