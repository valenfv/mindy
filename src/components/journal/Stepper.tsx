import { STEPS, TOTAL_STEPS } from '@/lib/questions'

interface StepperProps {
  currentStep: number
}

/**
 * Indicador de progreso compacto: paso actual, total, nombre de la etapa y una
 * barra. Sin indicadores numerados por etapa para no ocupar altura de pantalla;
 * para volver atrás está el botón «Atrás» del pie del formulario.
 */
export function Stepper({ currentStep }: StepperProps) {
  const progress = Math.round((currentStep / TOTAL_STEPS) * 100)
  const currentName = STEPS[currentStep - 1]?.shortName ?? ''

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">
          <span className="text-muted-foreground">Paso </span>
          <span className="tabular-nums">{currentStep}</span>
          <span className="text-muted-foreground"> de </span>
          <span className="tabular-nums">{TOTAL_STEPS}</span>
          <span className="text-muted-foreground"> · </span>
          <span>{currentName}</span>
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">{progress}%</p>
      </div>

      {/* Barra de progreso general. El valor accesible viaja en el texto de arriba. */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={currentStep}
        aria-valuetext={`Paso ${currentStep} de ${TOTAL_STEPS}: ${currentName}`}
        className="h-1.5 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
