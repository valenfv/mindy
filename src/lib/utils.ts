import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Identificador único. `crypto.randomUUID` está disponible en todos los
 * navegadores modernos sobre HTTPS o localhost; el fallback cubre contextos no
 * seguros (por ejemplo, servir el build por IP en la red local).
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Versión 4, variante RFC 4122.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): ((...args: Args) => void) & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: Args | undefined

  const debounced = (...args: Args) => {
    pending = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      const current = pending
      pending = undefined
      if (current) fn(...current)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    pending = undefined
  }

  debounced.flush = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    const current = pending
    pending = undefined
    if (current) fn(...current)
  }

  return debounced
}
