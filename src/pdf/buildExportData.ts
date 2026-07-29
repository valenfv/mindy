import { filterByLocalDateRange, formatDateOnly, formatDateTime } from '@/lib/dates'
import { toQuestionAnswers, type QuestionAnswer } from '@/lib/questions'
import type { JournalEntry } from '@/models/journal'

export interface ExportEntryData {
  id: string
  createdAt: string
  createdAtLabel: string
  answers: QuestionAnswer[]
}

export interface ExportDocumentData {
  brandName: string
  title: string
  /** Rango elegido, ya formateado con el idioma del dispositivo. */
  rangeLabel: string
  generatedAtLabel: string
  total: number
  /** Entradas en orden cronológico, de la más antigua a la más reciente. */
  entries: ExportEntryData[]
  fileName: string
}

export interface BuildExportDataInput {
  entries: readonly JournalEntry[]
  /** `YYYY-MM-DD`, inclusive. */
  from: string
  /** `YYYY-MM-DD`, inclusive. */
  to: string
  generatedAt?: Date
}

/**
 * Arma los datos del PDF a partir de las entradas y el rango elegido.
 *
 * Es una función pura: no toca el DOM ni jsPDF, así el contenido del documento
 * se puede verificar en tests sin generar un PDF real.
 */
export function buildExportData({
  entries,
  from,
  to,
  generatedAt = new Date(),
}: BuildExportDataInput): ExportDocumentData {
  const inRange = filterByLocalDateRange(entries, from, to)

  const chronological = [...inRange].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  return {
    brandName: 'Mindy',
    title: 'Diario Mindy',
    rangeLabel: `Del ${formatDateOnly(from)} al ${formatDateOnly(to)}`,
    generatedAtLabel: formatDateTime(generatedAt.toISOString()),
    total: chronological.length,
    entries: chronological.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      createdAtLabel: formatDateTime(entry.createdAt),
      answers: toQuestionAnswers(entry),
    })),
    fileName: buildFileName(from, to),
  }
}

export function buildFileName(from: string, to: string): string {
  return `mindy-desde-${from}-hasta-${to}.pdf`
}
