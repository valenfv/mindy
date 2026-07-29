import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldErrorProps {
  id: string
  message?: string
  className?: string
}

/**
 * Mensaje de error junto al campo. El contenedor existe siempre y es una región
 * `alert`, para que los lectores de pantalla anuncien el error al aparecer.
 * El icono acompaña al color, así el estado no depende sólo del color.
 */
export function FieldError({ id, message, className }: FieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        'flex items-start gap-1.5 text-sm font-medium text-destructive',
        !message && 'sr-only',
        className,
      )}
    >
      {message ? (
        <>
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </>
      ) : null}
    </p>
  )
}
