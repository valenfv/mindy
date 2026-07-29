import { z } from 'zod'
import { EMOTION_IDS } from '@/lib/emotions'
import { CURRENT_SCHEMA_VERSION } from '@/models/journal'

export const MAX_TEXT_LENGTH = 2000
export const MAX_CUSTOM_EMOTION_LENGTH = 40

/**
 * Todas las reglas del formulario viven en un único `superRefine`.
 *
 * Motivo: en Zod los refinamientos a nivel de objeto sólo se ejecutan si el
 * parseo base tuvo éxito. Si las obligatoriedades vivieran en cada campo
 * (`.min(1)`), un campo vacío impediría evaluar la regla condicional de
 * «Otra» → emoción personalizada. Con el parseo base laxo (sólo tipos) el
 * refinamiento se ejecuta siempre y la validación por paso es predecible.
 */
export const journalFormSchema = z
  .object({
    situation: z.string(),
    literalThought: z.string(),
    feeling: z.string(),
    emotion: z.union([z.enum(EMOTION_IDS), z.literal('')]),
    customEmotion: z.string(),
    intensity: z.number(),
    reaction: z.string(),
    outcome: z.string(),
  })
  .superRefine((values, ctx) => {
    const required: { path: keyof typeof values; message: string }[] = [
      {
        path: 'situation',
        message: 'Contanos qué estaba pasando para poder continuar.',
      },
      {
        path: 'literalThought',
        message: 'Escribí el pensamiento tal como apareció.',
      },
      { path: 'feeling', message: 'Contanos qué sentiste en ese momento.' },
      { path: 'reaction', message: 'Contanos qué hiciste al pensar eso.' },
    ]

    for (const field of required) {
      const value = values[field.path]
      if (typeof value === 'string' && value.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.path],
          message: field.message,
        })
      }
    }

    const textFields: (keyof typeof values)[] = [
      'situation',
      'literalThought',
      'feeling',
      'reaction',
      'outcome',
    ]

    for (const path of textFields) {
      const value = values[path]
      if (typeof value === 'string' && value.trim().length > MAX_TEXT_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path],
          message: `Por ahora el máximo son ${MAX_TEXT_LENGTH.toLocaleString('es')} caracteres.`,
        })
      }
    }

    if (values.emotion === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['emotion'],
        message: 'Elegí la emoción que más se acerque a lo que sentiste.',
      })
    }

    if (values.emotion === 'otra') {
      const custom = values.customEmotion.trim()
      if (custom.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customEmotion'],
          message: 'Escribí con qué nombre querés registrar esa emoción.',
        })
      } else if (custom.length > MAX_CUSTOM_EMOTION_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customEmotion'],
          message: `Usá hasta ${MAX_CUSTOM_EMOTION_LENGTH} caracteres.`,
        })
      }
    }

    if (!Number.isInteger(values.intensity) || values.intensity < 1 || values.intensity > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['intensity'],
        message: 'Elegí una intensidad entre 1 y 10.',
      })
    }
  })

export type JournalFormSchema = z.infer<typeof journalFormSchema>

/** Sólo el último paso, usado al completar una entrada desde el historial. */
export const outcomeSchema = z.object({
  outcome: z
    .string()
    .trim()
    .min(1, 'Contanos qué pasó después para cerrar esta entrada.')
    .max(MAX_TEXT_LENGTH, `Por ahora el máximo son ${MAX_TEXT_LENGTH} caracteres.`),
})

export type OutcomeFormValues = z.input<typeof outcomeSchema>

/**
 * Validación de los registros que vuelven de IndexedDB. Permite detectar datos
 * corruptos o de una versión incompatible sin romper toda la pantalla.
 */
export const storedEntrySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  situation: z.string(),
  literalThought: z.string(),
  feeling: z.string(),
  emotion: z.enum(EMOTION_IDS),
  customEmotion: z.string().optional(),
  intensity: z.number().int().min(1).max(10),
  reaction: z.string(),
  outcome: z.string().optional(),
  isOutcomeComplete: z.boolean(),
  schemaVersion: z.number().int().min(1).max(CURRENT_SCHEMA_VERSION),
})
