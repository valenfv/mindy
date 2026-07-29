import { describe, expect, it } from 'vitest'
import {
  endOfLocalDay,
  filterByLocalDateRange,
  isValidDateInput,
  startOfLocalDay,
  toDateInputValue,
} from '@/lib/dates'
import { localIso } from '@/test/factories'

describe('isValidDateInput', () => {
  it('acepta fechas reales en formato YYYY-MM-DD', () => {
    expect(isValidDateInput('2026-05-01')).toBe(true)
    expect(isValidDateInput('2024-02-29')).toBe(true)
  })

  it('rechaza formatos y días inexistentes', () => {
    expect(isValidDateInput('')).toBe(false)
    expect(isValidDateInput('01-05-2026')).toBe(false)
    expect(isValidDateInput('2026-13-01')).toBe(false)
    expect(isValidDateInput('2026-02-30')).toBe(false)
    expect(isValidDateInput('2025-02-29')).toBe(false)
  })
})

describe('límites del día local', () => {
  it('arranca a las 00:00:00.000 locales', () => {
    const start = startOfLocalDay('2026-05-01')
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
    expect(start.getDate()).toBe(1)
  })

  it('termina a las 23:59:59.999 locales', () => {
    const end = endOfLocalDay('2026-05-10')
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
    expect(end.getDate()).toBe(10)
  })
})

describe('filterByLocalDateRange', () => {
  const items = [
    { id: 'antes', createdAt: localIso(2026, 4, 30, 23, 59) },
    { id: 'primer-instante', createdAt: localIso(2026, 5, 1, 0, 0) },
    { id: 'medio', createdAt: localIso(2026, 5, 5, 14, 30) },
    { id: 'ultimo-instante', createdAt: localIso(2026, 5, 10, 23, 59) },
    { id: 'despues', createdAt: localIso(2026, 5, 11, 0, 0) },
  ]

  it('incluye ambos extremos del rango', () => {
    const result = filterByLocalDateRange(items, '2026-05-01', '2026-05-10')
    expect(result.map((item) => item.id)).toEqual([
      'primer-instante',
      'medio',
      'ultimo-instante',
    ])
  })

  it('incluye el último milisegundo del día final', () => {
    const lastMs = [{ id: 'limite', createdAt: localIso(2026, 5, 10, 23, 59) }]
    const withMs = [
      {
        id: 'limite-exacto',
        createdAt: new Date(2026, 4, 10, 23, 59, 59, 999).toISOString(),
      },
    ]

    expect(filterByLocalDateRange(lastMs, '2026-05-10', '2026-05-10')).toHaveLength(1)
    expect(filterByLocalDateRange(withMs, '2026-05-10', '2026-05-10')).toHaveLength(1)
  })

  it('acepta un rango de un solo día', () => {
    const result = filterByLocalDateRange(items, '2026-05-05', '2026-05-05')
    expect(result.map((item) => item.id)).toEqual(['medio'])
  })

  it('devuelve vacío cuando no hay nada en el rango', () => {
    expect(filterByLocalDateRange(items, '2026-06-01', '2026-06-30')).toEqual([])
  })

  it('descarta fechas no parseables en lugar de romper', () => {
    const withGarbage = [{ id: 'roto', createdAt: 'no-es-una-fecha' }]
    expect(filterByLocalDateRange(withGarbage, '2026-05-01', '2026-05-10')).toEqual([])
  })

  it('conserva el orden de entrada', () => {
    const result = filterByLocalDateRange(items, '2026-01-01', '2026-12-31')
    expect(result.map((item) => item.id)).toEqual(items.map((item) => item.id))
  })
})

describe('toDateInputValue', () => {
  it('usa la fecha local, sin desplazarse por la zona horaria', () => {
    // 1 de enero a las 00:30 locales debe seguir siendo el día 1.
    expect(toDateInputValue(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01')
    expect(toDateInputValue(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31')
  })
})
