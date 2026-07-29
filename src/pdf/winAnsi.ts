/**
 * Las fuentes base de PDF (Helvetica y compañía) usan la codificación WinAnsi,
 * que cubre por completo el español: tildes, ñ, ü, ¿, ¡ y los signos
 * tipográficos habituales. Los caracteres fuera de esa tabla —emojis, flechas,
 * alfabetos no latinos— no tienen glifo, así que se reemplazan por `?` para que
 * la pérdida sea visible en lugar de generar un PDF corrupto o texto en blanco.
 */

/** Code points admitidos por encima de Latin-1. */
const EXTRA_WIN_ANSI = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039,
  0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122,
  0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
])

function isSupported(codePoint: number): boolean {
  if (codePoint === 0x0a) return true // Salto de línea.
  if (codePoint < 0x20) return false // Otros caracteres de control.
  if (codePoint <= 0xff) return true // Latin-1 imprimible.
  return EXTRA_WIN_ANSI.has(codePoint)
}

/** Deja el texto listo para imprimirse con las fuentes base del PDF. */
export function toWinAnsiSafe(text: string): string {
  let result = ''

  for (const character of text.normalize('NFC')) {
    const codePoint = character.codePointAt(0)
    if (codePoint === undefined) continue
    result += isSupported(codePoint) ? character : '?'
  }

  return result
}
