import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface StepShellProps {
  /** Pregunta del paso; es el encabezado del bloque. */
  question: string
  hint?: ReactNode
  /** Muestra que el paso puede completarse más adelante. */
  optionalLabel?: string
  children: ReactNode
}

/**
 * Contenedor de un paso del journey.
 *
 * El foco al cambiar de paso lo maneja el wizard, que lo lleva al primer campo
 * del paso nuevo (ver `JournalWizard`). El encabezado sólo es texto.
 */
export function StepShell({ question, hint, optionalLabel, children }: StepShellProps) {
  return (
    <div className="animate-step-in motion-reduce:animate-none">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-balance text-lg font-semibold leading-snug sm:text-xl">
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
