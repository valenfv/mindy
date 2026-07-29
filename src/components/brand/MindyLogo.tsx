import { MindyMark } from '@/components/brand/MindyMark'
import { cn } from '@/lib/utils'

interface MindyLogoProps {
  className?: string
  /** Oculta el logotipo tipográfico y deja sólo el isotipo. */
  markOnly?: boolean
}

/** Logotipo completo: isotipo + tipografía serif con un ligero tracking. */
export function MindyLogo({ className, markOnly = false }: MindyLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-primary', className)}>
      <MindyMark className="size-8 shrink-0" />
      <span
        className={cn(
          'font-serif text-[1.375rem] font-semibold leading-none tracking-[-0.01em] text-foreground',
          markOnly && 'sr-only',
        )}
      >
        Mindy
      </span>
    </span>
  )
}
