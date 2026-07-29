import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/db/db'
import {
  clearDraft,
  EMPTY_FORM_VALUES,
  isDraftMeaningful,
  readDraft,
  saveDraft,
} from '@/db/drafts'
import { CURRENT_SCHEMA_VERSION, DRAFT_ID } from '@/models/journal'
import { makeFormValues } from '@/test/factories'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('isDraftMeaningful', () => {
  it('considera vacío un formulario sin tocar', () => {
    expect(isDraftMeaningful(EMPTY_FORM_VALUES)).toBe(false)
  })

  it('detecta contenido en cualquiera de los campos', () => {
    expect(isDraftMeaningful({ ...EMPTY_FORM_VALUES, situation: 'algo' })).toBe(true)
    expect(isDraftMeaningful({ ...EMPTY_FORM_VALUES, emotion: 'miedo' })).toBe(true)
    expect(isDraftMeaningful({ ...EMPTY_FORM_VALUES, outcome: 'algo' })).toBe(true)
  })

  it('no considera contenido a los espacios en blanco', () => {
    expect(isDraftMeaningful({ ...EMPTY_FORM_VALUES, situation: '    ' })).toBe(false)
  })
})

describe('restauración del borrador', () => {
  it('guarda y recupera el contenido y el paso', async () => {
    const values = makeFormValues({ situation: 'a medio escribir', outcome: '' })
    await saveDraft(values, 3)

    const draft = await readDraft()
    expect(draft?.step).toBe(3)
    expect(draft?.values.situation).toBe('a medio escribir')
    expect(draft?.values.emotion).toBe('ansiedad')
    expect(draft?.values.intensity).toBe(7)
  })

  it('mantiene un único borrador activo por más veces que se guarde', async () => {
    await saveDraft(makeFormValues({ situation: 'primera versión' }), 1)
    await saveDraft(makeFormValues({ situation: 'segunda versión' }), 2)
    await saveDraft(makeFormValues({ situation: 'tercera versión' }), 4)

    expect(await db.drafts.count()).toBe(1)

    const draft = await readDraft()
    expect(draft?.id).toBe(DRAFT_ID)
    expect(draft?.values.situation).toBe('tercera versión')
    expect(draft?.step).toBe(4)
  })

  it('no guarda un borrador vacío y limpia el que hubiera', async () => {
    await saveDraft(makeFormValues({ situation: 'algo' }), 2)
    expect(await db.drafts.count()).toBe(1)

    await saveDraft(EMPTY_FORM_VALUES, 1)

    expect(await db.drafts.count()).toBe(0)
    expect(await readDraft()).toBeUndefined()
  })

  it('devuelve undefined cuando no hay borrador', async () => {
    expect(await readDraft()).toBeUndefined()
  })

  it('elimina el borrador al limpiarlo', async () => {
    await saveDraft(makeFormValues(), 2)
    await clearDraft()
    expect(await readDraft()).toBeUndefined()
  })

  it('acota el paso guardado al rango válido', async () => {
    await saveDraft(makeFormValues(), 99)
    expect((await readDraft())?.step).toBe(5)

    await saveDraft(makeFormValues(), -3)
    expect((await readDraft())?.step).toBe(1)
  })

  it('sanea un borrador guardado con datos incompatibles', async () => {
    await db.drafts.put({
      id: DRAFT_ID,
      updatedAt: new Date().toISOString(),
      step: 2,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      values: {
        situation: 'sobrevive',
        literalThought: 42,
        emotion: 'emocion-inventada',
        intensity: 99,
      },
    } as never)

    const draft = await readDraft()
    expect(draft?.values.situation).toBe('sobrevive')
    expect(draft?.values.literalThought).toBe('')
    expect(draft?.values.emotion).toBe('')
    expect(draft?.values.intensity).toBe(EMPTY_FORM_VALUES.intensity)
  })
})
