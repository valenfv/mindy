import { useFormContext } from 'react-hook-form'
import { EmotionField } from '@/components/journal/EmotionField'
import { IntensityField } from '@/components/journal/IntensityField'
import { StepShell } from '@/components/journal/StepShell'
import { FieldError } from '@/components/ui/field-error'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QUESTIONS } from '@/lib/questions'
import type { JournalFormValues } from '@/models/journal'

/**
 * Paso 3: las tres dimensiones de la emoción en una sola pantalla —qué sentiste,
 * qué emoción fue y con cuánta intensidad—, separadas por reglas suaves.
 */
export function EmotionStep({ focusOnMount }: { focusOnMount: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<JournalFormValues>()

  const feelingError = errors.feeling?.message

  return (
    <StepShell
      question="¿Cómo te sentiste?"
      hint="Tres preguntas cortas para poner nombre a lo que pasó por tu cuerpo y tu ánimo."
      focusOnMount={focusOnMount}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="feeling">
            {QUESTIONS.feeling}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(obligatorio)</span>
          </Label>
          <p id="feeling-hint" className="text-sm text-muted-foreground">
            Sensaciones en el cuerpo, reacciones, cómo se sintió la experiencia.
          </p>
          <Textarea
            id="feeling"
            rows={3}
            placeholder="Se me cerró el pecho y me costaba respirar…"
            aria-invalid={feelingError ? true : undefined}
            aria-describedby={
              feelingError ? 'feeling-hint feeling-error' : 'feeling-hint'
            }
            className="min-h-[5rem] resize-y"
            {...register('feeling')}
          />
          <FieldError id="feeling-error" message={feelingError} />
        </div>

        <hr className="border-border/70" />

        <EmotionField />

        <hr className="border-border/70" />

        <IntensityField />
      </div>
    </StepShell>
  )
}
