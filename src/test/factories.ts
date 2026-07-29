import { CURRENT_SCHEMA_VERSION, type JournalEntry } from '@/models/journal'
import { EMPTY_FORM_VALUES } from '@/db/drafts'
import type { JournalFormValues } from '@/models/journal'

/** Entrada válida para tests, con overrides puntuales. */
export function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  const createdAt = overrides.createdAt ?? '2026-05-05T14:30:00.000Z'

  return {
    id: 'entry-1',
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
    situation: 'Estaba por entrar a una reunión.',
    literalThought: 'Esto me va a salir mal.',
    feeling: 'Se me cerró el pecho.',
    emotion: 'ansiedad',
    intensity: 7,
    reaction: 'Postergué la reunión.',
    isOutcomeComplete: false,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...overrides,
  }
}

/** Formulario completo y válido. */
export function makeFormValues(
  overrides: Partial<JournalFormValues> = {},
): JournalFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    situation: 'Estaba por entrar a una reunión.',
    literalThought: 'Esto me va a salir mal.',
    feeling: 'Se me cerró el pecho.',
    emotion: 'ansiedad',
    intensity: 7,
    reaction: 'Postergué la reunión.',
    ...overrides,
  }
}

/** Fecha local a ISO, para armar rangos sin ambigüedad de zona horaria. */
export function localIso(
  year: number,
  month: number,
  day: number,
  hours = 12,
  minutes = 0,
): string {
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString()
}
