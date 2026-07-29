/**
 * Utilidades de fecha. Toda comparación de rangos ocurre en la zona horaria
 * local del usuario: `2026-05-01` significa el comienzo del 1 de mayo tal como
 * lo vive esa persona, no las 00:00 UTC.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidDateInput(value: string): boolean {
  const match = DATE_ONLY.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

/** 00:00:00.000 local del día indicado. */
export function startOfLocalDay(value: string): Date {
  const match = DATE_ONLY.exec(value)
  if (!match) throw new Error(`Fecha inválida: ${value}`)
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0)
}

/** 23:59:59.999 local del día indicado, para que el rango sea inclusivo. */
export function endOfLocalDay(value: string): Date {
  const match = DATE_ONLY.exec(value)
  if (!match) throw new Error(`Fecha inválida: ${value}`)
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
    999,
  )
}

/** `YYYY-MM-DD` local de una fecha, apto para un `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Filtra por rango de fechas inclusivo en ambos extremos, usando la zona
 * horaria local. Devuelve los elementos en el mismo orden que entraron.
 */
export function filterByLocalDateRange<T extends { createdAt: string }>(
  items: readonly T[],
  from: string,
  to: string,
): T[] {
  const start = startOfLocalDay(from).getTime()
  const end = endOfLocalDay(to).getTime()

  return items.filter((item) => {
    const time = new Date(item.createdAt).getTime()
    if (Number.isNaN(time)) return false
    return time >= start && time <= end
  })
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' })

const shortDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida'
  return dateTimeFormatter.format(date)
}

export function formatShortDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida'
  return shortDateTimeFormatter.format(date)
}

/** Formatea un `YYYY-MM-DD` con el formato local, sin desfase de zona. */
export function formatDateOnly(value: string): string {
  if (!isValidDateInput(value)) return value
  return dateFormatter.format(startOfLocalDay(value))
}

/** Fecha relativa suave para el historial: «hoy», «ayer» o la fecha completa. */
export function formatRelativeDay(iso: string, now: Date = new Date()): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const time = date.getTime()

  if (time >= startOfToday) return 'Hoy'
  if (time >= startOfToday - dayMs) return 'Ayer'
  return null
}
