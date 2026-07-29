import { describe, expect, it } from 'vitest'
import { toWinAnsiSafe } from '@/pdf/winAnsi'

describe('toWinAnsiSafe', () => {
  it('conserva intactos los caracteres del español', () => {
    const text = '¿Qué sentí? Añoranza, ilusión, María, über, ¡vamos!'
    expect(toWinAnsiSafe(text)).toBe(text)
  })

  it('conserva los signos tipográficos habituales', () => {
    const text = '«Esto va a salir mal» — pensé… “literal”'
    expect(toWinAnsiSafe(text)).toBe(text)
  })

  it('conserva los saltos de línea', () => {
    expect(toWinAnsiSafe('línea uno\nlínea dos')).toBe('línea uno\nlínea dos')
  })

  it('compone las tildes descompuestas en un solo carácter', () => {
    // "á" escrita como a + acento combinante.
    expect(toWinAnsiSafe('ánimo')).toBe('ánimo')
  })

  it('reemplaza de forma visible lo que la fuente no puede dibujar', () => {
    // El emoji es un único code point, así que deja una única marca.
    expect(toWinAnsiSafe('me sentí 😞 hoy')).toBe('me sentí ? hoy')
  })
})
