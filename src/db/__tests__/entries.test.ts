import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/db/db'
import {
  buildEntryFromForm,
  canCompleteOutcome,
  completeOutcome,
  createEntry,
  deleteAllLocalData,
  deleteEntry,
  EntryRuleError,
  readEntries,
} from '@/db/entries'
import { DRAFT_ID, CURRENT_SCHEMA_VERSION } from '@/models/journal'
import { EMPTY_FORM_VALUES } from '@/db/drafts'
import { localIso, makeEntry, makeFormValues } from '@/test/factories'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('buildEntryFromForm', () => {
  it('crea una entrada con id, fechas ISO y versión de esquema', () => {
    const now = new Date('2026-05-05T14:30:00.000Z')
    const entry = buildEntryFromForm(makeFormValues(), now)

    expect(entry.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(entry.createdAt).toBe('2026-05-05T14:30:00.000Z')
    expect(entry.updatedAt).toBe(entry.createdAt)
    expect(entry.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('recorta los espacios de los textos', () => {
    const entry = buildEntryFromForm(makeFormValues({ situation: '  con espacios  ' }))
    expect(entry.situation).toBe('con espacios')
  })

  it('marca el último paso como pendiente cuando no hay resultado', () => {
    const entry = buildEntryFromForm(makeFormValues({ outcome: '   ' }))
    expect(entry.isOutcomeComplete).toBe(false)
    expect(entry.outcome).toBeUndefined()
  })

  it('marca el último paso como completo cuando hay resultado', () => {
    const entry = buildEntryFromForm(makeFormValues({ outcome: 'Salió bien.' }))
    expect(entry.isOutcomeComplete).toBe(true)
    expect(entry.outcome).toBe('Salió bien.')
  })

  it('guarda la emoción personalizada sólo cuando la emoción es «otra»', () => {
    const otra = buildEntryFromForm(
      makeFormValues({ emotion: 'otra', customEmotion: ' desborde ' }),
    )
    expect(otra.customEmotion).toBe('desborde')

    const conocida = buildEntryFromForm(
      makeFormValues({ emotion: 'miedo', customEmotion: 'desborde' }),
    )
    expect(conocida.customEmotion).toBeUndefined()
  })

  it('no permite crear una entrada sin emoción', () => {
    expect(() => buildEntryFromForm({ ...EMPTY_FORM_VALUES })).toThrow()
  })
})

describe('createEntry y readEntries', () => {
  it('persiste la entrada y la devuelve al leer', async () => {
    const created = await createEntry(makeFormValues())
    const { entries } = await readEntries()

    expect(entries).toHaveLength(1)
    expect(entries[0]?.id).toBe(created.id)
    expect(entries[0]?.situation).toBe('Estaba por entrar a una reunión.')
  })

  it('ordena de la más reciente a la más antigua', async () => {
    await createEntry(makeFormValues({ situation: 'vieja' }), new Date(localIso(2026, 5, 1)))
    await createEntry(makeFormValues({ situation: 'nueva' }), new Date(localIso(2026, 5, 20)))
    await createEntry(makeFormValues({ situation: 'media' }), new Date(localIso(2026, 5, 10)))

    const { entries } = await readEntries()
    expect(entries.map((entry) => entry.situation)).toEqual(['nueva', 'media', 'vieja'])
  })

  it('descarta registros corruptos sin perder los válidos', async () => {
    await createEntry(makeFormValues({ situation: 'válida' }))
    // Registro con forma incompatible, como podría quedar tras una migración fallida.
    await db.entries.put({ id: 'roto', situation: 'sin el resto de los campos' } as never)

    const { entries, corruptedCount } = await readEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0]?.situation).toBe('válida')
    expect(corruptedCount).toBe(1)
  })
})

describe('permisos de edición', () => {
  it('permite completar mientras el último paso siga pendiente', () => {
    expect(canCompleteOutcome(makeEntry({ isOutcomeComplete: false }))).toBe(true)
  })

  it('bloquea la edición de una entrada ya completa', () => {
    expect(canCompleteOutcome(makeEntry({ isOutcomeComplete: true }))).toBe(false)
  })

  it('completa el último paso y actualiza updatedAt', async () => {
    const created = await createEntry(
      makeFormValues({ outcome: '' }),
      new Date('2026-05-05T14:30:00.000Z'),
    )
    expect(created.isOutcomeComplete).toBe(false)

    const updated = await completeOutcome(
      created.id,
      '  Al día siguiente hablamos.  ',
      new Date('2026-05-08T09:00:00.000Z'),
    )

    expect(updated.outcome).toBe('Al día siguiente hablamos.')
    expect(updated.isOutcomeComplete).toBe(true)
    expect(updated.updatedAt).toBe('2026-05-08T09:00:00.000Z')
    expect(updated.createdAt).toBe(created.createdAt)

    const stored = await db.entries.get(created.id)
    expect(stored?.isOutcomeComplete).toBe(true)
  })

  it('no deja volver a editar una entrada completa', async () => {
    const created = await createEntry(makeFormValues({ outcome: 'Ya estaba resuelto.' }))

    await expect(completeOutcome(created.id, 'Otro texto')).rejects.toBeInstanceOf(
      EntryRuleError,
    )

    const stored = await db.entries.get(created.id)
    expect(stored?.outcome).toBe('Ya estaba resuelto.')
  })

  it('rechaza completar con un texto vacío', async () => {
    const created = await createEntry(makeFormValues({ outcome: '' }))
    await expect(completeOutcome(created.id, '   ')).rejects.toBeInstanceOf(EntryRuleError)
  })

  it('avisa cuando la entrada ya no existe', async () => {
    await expect(completeOutcome('inexistente', 'algo')).rejects.toBeInstanceOf(EntryRuleError)
  })
})

describe('eliminación', () => {
  it('elimina una entrada y deja las demás', async () => {
    const first = await createEntry(makeFormValues({ situation: 'primera' }))
    await createEntry(makeFormValues({ situation: 'segunda' }))

    await deleteEntry(first.id)

    const { entries } = await readEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0]?.situation).toBe('segunda')
  })

  it('elimina todos los datos locales, incluido el borrador', async () => {
    await createEntry(makeFormValues())
    await db.drafts.put({
      id: DRAFT_ID,
      updatedAt: new Date().toISOString(),
      step: 2,
      values: makeFormValues(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    })

    await deleteAllLocalData()

    expect(await db.entries.count()).toBe(0)
    expect(await db.drafts.count()).toBe(0)
  })
})
