import { describe, expect, it } from 'vitest'
import { journalFormSchema, outcomeSchema } from '@/schemas/journal'
import { makeFormValues } from '@/test/factories'

/** Devuelve los campos que fallaron, para aserciones legibles. */
function invalidFields(values: unknown): string[] {
  const result = journalFormSchema.safeParse(values)
  if (result.success) return []
  return result.error.issues.map((issue) => issue.path.join('.'))
}

describe('journalFormSchema', () => {
  it('acepta un formulario completo', () => {
    expect(invalidFields(makeFormValues())).toEqual([])
  })

  it('acepta el formulario sin «qué pasó después», que es opcional', () => {
    expect(invalidFields(makeFormValues({ outcome: '' }))).toEqual([])
  })

  it('exige situación, pensamiento, sensación y conducta', () => {
    const fields = invalidFields(
      makeFormValues({
        situation: '',
        literalThought: '',
        feeling: '',
        reaction: '',
      }),
    )

    expect(fields).toContain('situation')
    expect(fields).toContain('literalThought')
    expect(fields).toContain('feeling')
    expect(fields).toContain('reaction')
  })

  it('no acepta texto compuesto sólo de espacios', () => {
    expect(invalidFields(makeFormValues({ situation: '   \n  ' }))).toContain('situation')
  })

  it('exige elegir al menos una emoción', () => {
    expect(invalidFields(makeFormValues({ emotions: [] }))).toContain('emotions')
  })

  it('acepta varias emociones a la vez', () => {
    expect(
      invalidFields(makeFormValues({ emotions: ['miedo', 'tristeza', 'culpa'] })),
    ).toEqual([])
  })

  it('exige la emoción personalizada cuando se elige «otra»', () => {
    expect(
      invalidFields(makeFormValues({ emotions: ['otra'], customEmotion: '' })),
    ).toContain('customEmotion')
  })

  it('acepta «otra» con una emoción personalizada', () => {
    expect(
      invalidFields(makeFormValues({ emotions: ['otra'], customEmotion: 'desborde' })),
    ).toEqual([])
  })

  it('ignora la emoción personalizada si la emoción no es «otra»', () => {
    expect(
      invalidFields(makeFormValues({ emotions: ['miedo'], customEmotion: '' })),
    ).toEqual([])
  })

  it('limita el largo de la emoción personalizada', () => {
    expect(
      invalidFields(makeFormValues({ emotions: ['otra'], customEmotion: 'a'.repeat(41) })),
    ).toContain('customEmotion')
  })

  it('valida la regla condicional incluso con otros campos vacíos', () => {
    // El refinamiento único garantiza que se evalúe siempre, no sólo cuando el
    // resto del formulario ya está completo.
    const fields = invalidFields(
      makeFormValues({ situation: '', emotions: ['otra'], customEmotion: '' }),
    )

    expect(fields).toContain('situation')
    expect(fields).toContain('customEmotion')
  })

  it('acepta la intensidad en los extremos del rango', () => {
    expect(invalidFields(makeFormValues({ intensity: 1 }))).toEqual([])
    expect(invalidFields(makeFormValues({ intensity: 10 }))).toEqual([])
  })

  it('rechaza intensidades fuera de 1 a 10 y no enteras', () => {
    expect(invalidFields(makeFormValues({ intensity: 0 }))).toContain('intensity')
    expect(invalidFields(makeFormValues({ intensity: 11 }))).toContain('intensity')
    expect(invalidFields(makeFormValues({ intensity: 5.5 }))).toContain('intensity')
  })

  it('limita el largo de los textos abiertos', () => {
    expect(invalidFields(makeFormValues({ situation: 'a'.repeat(2001) }))).toContain('situation')
    expect(invalidFields(makeFormValues({ situation: 'a'.repeat(2000) }))).toEqual([])
  })
})

describe('outcomeSchema', () => {
  it('exige contenido para cerrar la entrada', () => {
    expect(outcomeSchema.safeParse({ outcome: '   ' }).success).toBe(false)
  })

  it('recorta los espacios del texto guardado', () => {
    const result = outcomeSchema.parse({ outcome: '  Al día siguiente hablamos.  ' })
    expect(result.outcome).toBe('Al día siguiente hablamos.')
  })
})
