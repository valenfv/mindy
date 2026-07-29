import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Recordatorio discreto de que nada sale del dispositivo. */
export function PrivacyNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'flex items-center justify-center gap-2 text-center text-xs text-muted-foreground',
        className,
      )}
    >
      <Lock aria-hidden="true" className="size-3.5 shrink-0" />
      Tus entradas se guardan únicamente en este dispositivo.
    </p>
  )
}
