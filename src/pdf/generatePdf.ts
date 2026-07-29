import type { jsPDF } from 'jspdf'
import type { ExportDocumentData } from '@/pdf/buildExportData'
import { toWinAnsiSafe } from '@/pdf/winAnsi'

/** Error de generación con un mensaje apto para mostrar tal cual. */
export class PdfGenerationError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'PdfGenerationError'
    this.cause = cause
  }
}

const PAGE = { width: 595.28, height: 841.89 } // A4 en puntos.
const MARGIN = { top: 54, right: 56, bottom: 62, left: 56 }
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right
const CONTENT_BOTTOM = PAGE.height - MARGIN.bottom

const INK: [number, number, number] = [38, 34, 30]
const MUTED: [number, number, number] = [107, 99, 91]
const PRIMARY: [number, number, number] = [61, 107, 96]
const ACCENT: [number, number, number] = [201, 127, 79]
const RULE: [number, number, number] = [223, 214, 203]
const PAPER: [number, number, number] = [250, 247, 241]

/**
 * Genera el PDF del diario completamente en el navegador y dispara la descarga.
 * No hay ninguna llamada de red: jsPDF construye el documento en memoria.
 *
 * jsPDF se importa de forma dinámica para que su peso no entre en el bundle
 * inicial: sólo se descarga cuando alguien exporta de verdad.
 */
export async function generateJournalPdf(data: ExportDocumentData): Promise<void> {
  let jsPDFConstructor: typeof jsPDF
  try {
    jsPDFConstructor = (await import('jspdf')).jsPDF
  } catch (error) {
    throw new PdfGenerationError(
      'No pudimos cargar el generador de PDF. Si estás sin conexión y es la primera vez que exportás, conectate un momento y volvé a intentar.',
      error,
    )
  }

  try {
    const doc = new jsPDFConstructor({ unit: 'pt', format: 'a4', compress: true })

    doc.setProperties({
      title: data.title,
      subject: `${data.title} · ${data.rangeLabel}`,
      author: data.brandName,
      creator: data.brandName,
    })

    let cursorY = MARGIN.top

    /** Reserva espacio vertical; si no alcanza, abre una página nueva. */
    const ensureSpace = (needed: number) => {
      if (cursorY + needed <= CONTENT_BOTTOM) return
      doc.addPage()
      cursorY = MARGIN.top
      drawRunningHeader(doc, data)
      cursorY += 22
    }

    /** Escribe un párrafo con saltos de página automáticos. */
    const writeParagraph = (
      text: string,
      options: {
        size: number
        style?: 'normal' | 'bold' | 'italic'
        color?: [number, number, number]
        lineHeight?: number
        spaceAfter?: number
      },
    ) => {
      const { size, style = 'normal', color = INK, spaceAfter = 0 } = options
      const lineHeight = options.lineHeight ?? size * 1.45

      doc.setFont('helvetica', style)
      doc.setFontSize(size)
      doc.setTextColor(...color)

      // Se respetan los saltos de línea que escribió la persona.
      const blocks = toWinAnsiSafe(text).split('\n')

      blocks.forEach((block, blockIndex) => {
        if (block.trim().length === 0) {
          // Línea vacía intencional entre párrafos.
          if (blockIndex < blocks.length - 1) {
            ensureSpace(lineHeight * 0.6)
            cursorY += lineHeight * 0.6
          }
          return
        }

        const lines = doc.splitTextToSize(block, CONTENT_WIDTH) as string[]
        for (const line of lines) {
          ensureSpace(lineHeight)
          doc.text(line, MARGIN.left, cursorY + size * 0.86)
          cursorY += lineHeight
        }
      })

      cursorY += spaceAfter
    }

    const drawRule = (spaceBefore = 0, spaceAfter = 0) => {
      cursorY += spaceBefore
      ensureSpace(1)
      doc.setDrawColor(...RULE)
      doc.setLineWidth(0.7)
      doc.line(MARGIN.left, cursorY, PAGE.width - MARGIN.right, cursorY)
      cursorY += spaceAfter
    }

    // ---- Portada / encabezado ----
    drawBrandMark(doc, MARGIN.left, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PRIMARY)
    doc.text(toWinAnsiSafe(data.brandName), MARGIN.left + 30, cursorY + 15)

    cursorY += 46

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...INK)
    doc.text(toWinAnsiSafe(data.title), MARGIN.left, cursorY)
    cursorY += 16

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)

    const summaryLines = [
      data.rangeLabel,
      `Generado el ${data.generatedAtLabel}`,
      data.total === 1 ? '1 entrada' : `${data.total} entradas`,
    ]

    for (const line of summaryLines) {
      cursorY += 14
      doc.text(toWinAnsiSafe(line), MARGIN.left, cursorY)
    }

    cursorY += 8
    drawRule(10, 26)

    // ---- Entradas ----
    if (data.entries.length === 0) {
      writeParagraph('No hay entradas registradas en este rango de fechas.', {
        size: 11,
        color: MUTED,
        style: 'italic',
      })
    }

    data.entries.forEach((entry, index) => {
      if (index > 0) drawRule(8, 24)

      // La fecha no debe quedar sola al pie de una página.
      ensureSpace(64)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...PRIMARY)
      doc.text(toWinAnsiSafe(entry.createdAtLabel), MARGIN.left, cursorY + 10)
      cursorY += 26

      entry.answers.forEach((answer) => {
        ensureSpace(30)
        writeParagraph(answer.question, {
          size: 9.5,
          style: 'bold',
          color: MUTED,
          spaceAfter: 2,
        })
        writeParagraph(answer.answer, {
          size: 10.5,
          style: answer.pending ? 'italic' : 'normal',
          color: answer.pending ? ACCENT : INK,
          spaceAfter: 10,
        })
      })
    })

    // ---- Numeración, una vez conocido el total de páginas ----
    const pageCount = doc.getNumberOfPages()
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...MUTED)
      doc.text(
        toWinAnsiSafe(`Página ${page} de ${pageCount}`),
        PAGE.width / 2,
        PAGE.height - 30,
        { align: 'center' },
      )
    }

    doc.save(data.fileName)
  } catch (error) {
    throw new PdfGenerationError(
      'No pudimos generar el PDF en este dispositivo. Probá con un rango más corto o volvé a intentar.',
      error,
    )
  }
}

/**
 * Isotipo reducido para el PDF: el anillo y el núcleo cálido del logo, sin los
 * detalles finos de la espiral, que a este tamaño no se leerían.
 */
function drawBrandMark(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...PRIMARY)
  doc.roundedRect(x, y, 22, 22, 6, 6, 'F')

  doc.setDrawColor(...PAPER)
  doc.setLineWidth(1.8)
  doc.circle(x + 11, y + 11, 6, 'S')

  doc.setFillColor(...ACCENT)
  doc.circle(x + 11, y + 11, 2.2, 'F')
}

/** Encabezado discreto en las páginas siguientes a la primera. */
function drawRunningHeader(doc: jsPDF, data: ExportDocumentData) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MUTED)
  doc.text(toWinAnsiSafe(data.title), PAGE.width - MARGIN.right, MARGIN.top - 16, {
    align: 'right',
  })
}
