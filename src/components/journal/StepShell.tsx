import { useEffect, useRef, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface StepShellProps {
  /** Pregunta del paso; es el encabezado del bloque. */
  question: string
  hint?: ReactNode
  /** Muestra que el paso puede completarse más adelante. */
  optionalLabel?: string
  children: ReactNode
  /** Mueve el foco al encabezado al entrar al paso. */
  focusOnMount: boolean
}

/**
 * Contenedor de un paso del journey.
 *
 * El foco se lleva al encabezado (no al campo) al cambiar de paso: los lectores
 * de pantalla anuncian la pregunta nueva y en mobile no se abre el teclado de
 * golpe. El primer campo queda a un Tab de distancia.
 */
export function StepShell({
  question,
  hint,
  optionalLabel,
  children,
  focusOnMount,
}: StepShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus()
  }, [focusOnMount])

  return (
    <div className="animate-step-in motion-reduce:animate-none">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-balance text-lg font-semibold leading-snug sm:text-xl"
        >
          {question}
        </h2>
        {optionalLabel ? <Badge variant="outline">{optionalLabel}</Badge> : null}
      </div>

      {hint ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}

      <div className="mt-3.5">{children}</div>
    </div>
  )
}
