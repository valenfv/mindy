import { z } from 'zod'
import { isValidDateInput, startOfLocalDay } from '@/lib/dates'

export const exportRangeSchema = z
  .object({
    from: z.string().min(1, 'Elegí la fecha desde.'),
    to: z.string().min(1, 'Elegí la fecha hasta.'),
  })
  .superRefine((values, ctx) => {
    const fromValid = isValidDateInput(values.from)
    const toValid = isValidDateInput(values.to)

    if (values.from.length > 0 && !fromValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['from'],
        message: 'La fecha desde no es válida.',
      })
    }

    if (values.to.length > 0 && !toValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: 'La fecha hasta no es válida.',
      })
    }

    if (fromValid && toValid) {
      if (startOfLocalDay(values.from).getTime() > startOfLocalDay(values.to).getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to'],
          message: 'La fecha desde no puede ser posterior a la fecha hasta.',
        })
      }
    }
  })

export type ExportRangeValues = z.infer<typeof exportRangeSchema>
