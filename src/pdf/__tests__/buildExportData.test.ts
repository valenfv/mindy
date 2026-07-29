import { describe, expect, it } from 'vitest'
import { QUESTIONS, OUTCOME_PENDING_TEXT } from '@/lib/questions'
import { buildExportData, buildFileName } from '@/pdf/buildExportData'
import { localIso, makeEntry } from '@/test/factories'

const entries = [
  makeEntry({ id: 'b', createdAt: localIso(2026, 5, 5, 10, 0), situation: 'del medio' }),
  makeEntry({ id: 'a', createdAt: localIso(2026, 5, 1, 8, 0), situation: 'la primera' }),
  makeEntry({ id: 'c', createdAt: localIso(2026, 5, 10, 22, 0), situation: 'la última' }),
  makeEntry({ id: 'fuera', createdAt: localIso(2026, 6, 2, 9, 0), situation: 'fuera de rango' }),
]

describe('buildExportData', () => {
  it('incluye sólo las entradas del rango, con ambos extremos inclusive', () => {
    const data = buildExportData({ entries, from: '2026-05-01', to: '2026-05-10' })

    expect(data.total).toBe(3)
    expect(data.entries.map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
  })

  it('ordena cronológicamente, de la más antigua a la más reciente', () => {
    const data = buildExportData({ entries, from: '2026-01-01', to: '2026-12-31' })
    // La primera respuesta de cada entrada es la situación.
    expect(data.entries.map((entry) => entry.answers[0]?.answer)).toEqual([
      'la primera',
      'del medio',
      'la última',
      'fuera de rango',
    ])
  })

  it('devuelve un documento vacío cuando el rango no tiene entradas', () => {
    const data = buildExportData({ entries, from: '2026-08-01', to: '2026-08-31' })
    expect(data.total).toBe(0)
    expect(data.entries).toEqual([])
  })

  it('arma el nombre de archivo con el rango elegido', () => {
    const data = buildExportData({ entries, from: '2026-05-01', to: '2026-05-10' })
    expect(data.fileName).toBe('mindy-desde-2026-05-01-hasta-2026-05-10.pdf')
    expect(buildFileName('2026-01-31', '2026-02-01')).toBe(
      'mindy-desde-2026-01-31-hasta-2026-02-01.pdf',
    )
  })

  it('incluye el título, el rango, la fecha de generación y el total', () => {
    const data = buildExportData({
      entries,
      from: '2026-05-01',
      to: '2026-05-10',
      generatedAt: new Date(localIso(2026, 7, 28, 9, 15)),
    })

    expect(data.title).toBe('Diario Mindy')
    expect(data.brandName).toBe('Mindy')
    expect(data.rangeLabel).toContain('2026')
    expect(data.generatedAtLabel).toContain('2026')
    expect(data.total).toBe(data.entries.length)
  })

  it('imprime las siete preguntas de cada entrada, en orden', () => {
    const data = buildExportData({
      entries: [makeEntry()],
      from: '2026-05-05',
      to: '2026-05-05',
    })

    expect(data.entries[0]?.answers.map((answer) => answer.question)).toEqual([
      QUESTIONS.situation,
      QUESTIONS.literalThought,
      QUESTIONS.feeling,
      QUESTIONS.emotion,
      QUESTIONS.intensity,
      QUESTIONS.reaction,
      QUESTIONS.outcome,
    ])
  })

  it('expresa la intensidad como X/10', () => {
    const data = buildExportData({
      entries: [makeEntry({ intensity: 8 })],
      from: '2026-05-05',
      to: '2026-05-05',
    })

    const intensity = data.entries[0]?.answers.find(
      (answer) => answer.question === QUESTIONS.intensity,
    )
    expect(intensity?.answer).toContain('8/10')
  })

  it('marca claramente el último paso cuando está pendiente', () => {
    const data = buildExportData({
      entries: [makeEntry({ isOutcomeComplete: false, outcome: undefined })],
      from: '2026-05-05',
      to: '2026-05-05',
    })

    const outcome = data.entries[0]?.answers.at(-1)
    expect(outcome?.pending).toBe(true)
    expect(outcome?.answer).toBe(OUTCOME_PENDING_TEXT)
  })

  it('incluye tanto entradas completas como pendientes', () => {
    const data = buildExportData({
      entries: [
        makeEntry({ id: 'pendiente', createdAt: localIso(2026, 5, 2), isOutcomeComplete: false }),
        makeEntry({
          id: 'completa',
          createdAt: localIso(2026, 5, 3),
          outcome: 'Se resolvió.',
          isOutcomeComplete: true,
        }),
      ],
      from: '2026-05-01',
      to: '2026-05-31',
    })

    expect(data.entries.map((entry) => entry.id)).toEqual(['pendiente', 'completa'])
    expect(data.entries[0]?.answers.at(-1)?.pending).toBe(true)
    expect(data.entries[1]?.answers.at(-1)?.answer).toBe('Se resolvió.')
  })

  it('usa la emoción personalizada cuando corresponde', () => {
    const data = buildExportData({
      entries: [makeEntry({ emotions: ['otra'], customEmotion: 'desborde' })],
      from: '2026-05-05',
      to: '2026-05-05',
    })

    const emotion = data.entries[0]?.answers.find(
      (answer) => answer.question === QUESTIONS.emotion,
    )
    expect(emotion?.answer).toBe('desborde')
  })

  it('enumera todas las emociones de la entrada', () => {
    const data = buildExportData({
      entries: [
        makeEntry({ emotions: ['miedo', 'culpa', 'otra'], customEmotion: 'desborde' }),
      ],
      from: '2026-05-05',
      to: '2026-05-05',
    })

    const emotion = data.entries[0]?.answers.find(
      (answer) => answer.question === QUESTIONS.emotion,
    )
    expect(emotion?.answer).toBe('Miedo, Culpa, desborde')
  })
})
