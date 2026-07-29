import { cn } from '@/lib/utils'

interface MindyMarkProps {
  className?: string
  /** El trazo exterior usa `currentColor`; el núcleo cálido, el acento. */
  spinning?: boolean
}

/**
 * Isotipo de Mindy: una espiral abierta de vuelta y media, con el núcleo en
 * color de acento. Trazos gruesos y sin detalles finos para que se sostenga a
 * 16px, sobre fondo claro u oscuro.
 */
export function MindyMark({ className, spinning = false }: MindyMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn('size-8', className)}
    >
      <g
        fill="none"
        strokeWidth={5.6}
        strokeLinecap="round"
        transform="translate(-3 0)"
        className={cn(
          spinning && 'origin-center motion-safe:animate-[spin_2.4s_linear_infinite]',
        )}
        style={spinning ? { transformOrigin: '50% 50%' } : undefined}
      >
        <path d="M32 8A24 24 0 0 1 32 56A18 18 0 0 1 32 20" stroke="currentColor" />
        <path d="M32 20A12 12 0 0 1 32 44" className="stroke-accent" />
      </g>
    </svg>
  )
}
