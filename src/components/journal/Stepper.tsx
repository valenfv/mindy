import { Check } from 'lucide-react'
import { STEPS, TOTAL_STEPS } from '@/lib/questions'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStep: number
  /** Permite volver a un paso ya visitado. */
  onSelectStep?: (step: number) => void
}

/**
 * Stepper con paso actual, total, progreso y nombre de cada etapa. Los nombres
 * aparecen cuando hay espacio; en pantallas chicas quedan los indicadores más
 * el texto «Paso X de Y», que nunca se oculta.
 */
export function Stepper({ currentStep, onSelectStep }: StepperProps) {
  const progress = Math.round((currentStep / TOTAL_STEPS) * 100)
  const currentName = STEPS[currentStep - 1]?.shortName ?? ''

  return (
    <div className="space-y-3">
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

      <ol className="flex items-start gap-1.5" aria-label="Etapas del registro">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isCurrent = stepNumber === currentStep
          const isDone = stepNumber < currentStep
          const canNavigate = isDone && Boolean(onSelectStep)

          const indicator = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-6 shrink-0 place-content-center rounded-full border text-[0.6875rem] font-semibold tabular-nums transition-colors',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isDone && 'border-primary/40 bg-primary-soft text-primary',
                  !isCurrent && !isDone && 'border-border bg-transparent text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-3.5" strokeWidth={3} /> : stepNumber}
              </span>
              <span
                className={cn(
                  'hidden truncate text-xs sm:block',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.shortName}
              </span>
            </>
          )

          return (
            <li key={step.id} className="min-w-0 flex-1">
              {canNavigate ? (
                <button
                  type="button"
                  onClick={() => onSelectStep?.(stepNumber)}
                  className="flex w-full min-w-0 flex-col items-center gap-1.5 rounded-md py-1 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="sr-only">
                    Volver al paso {stepNumber}: {step.shortName}
                  </span>
                  {indicator}
                </button>
              ) : (
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex min-w-0 flex-col items-center gap-1.5 py-1"
                >
                  <span className="sr-only">
                    Paso {stepNumber}: {step.shortName}
                    {isCurrent ? ' (paso actual)' : ''}
                  </span>
                  {indicator}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
