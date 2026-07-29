import { useFormContext, useWatch } from 'react-hook-form'
import type { ReactNode } from 'react'
import { StepShell } from '@/components/journal/StepShell'
import { FieldError } from '@/components/ui/field-error'
import { Textarea } from '@/components/ui/textarea'
import { MAX_TEXT_LENGTH } from '@/schemas/journal'
import type { JournalFormValues } from '@/models/journal'

type TextFieldName = 'situation' | 'literalThought' | 'reaction' | 'outcome'

interface TextareaStepProps {
  name: TextFieldName
  question: string
  hint?: ReactNode
  placeholder: string
  /** Etiqueta accesible del campo, distinta del encabezado visual. */
  ariaLabel?: string
  optionalLabel?: string
  rows?: number
  focusOnMount: boolean
}

/**
 * Paso de una sola pregunta abierta. Los pasos 1, 2, 4 y 5 comparten esta
 * estructura; sólo cambian el texto y si el campo es obligatorio.
 */
export function TextareaStep({
  name,
  question,
  hint,
  placeholder,
  ariaLabel,
  optionalLabel,
  rows = 7,
  focusOnMount,
}: TextareaStepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JournalFormValues>()

  const value = useWatch({ control, name }) ?? ''
  const error = errors[name]?.message
  const errorId = `${name}-error`
  const hintId = hint ? `${name}-hint` : undefined

  // El contador aparece sólo cuando el texto se acerca al límite.
  const showCounter = value.length > MAX_TEXT_LENGTH * 0.8

  return (
    <StepShell
      question={question}
      hint={hint ? <span id={hintId}>{hint}</span> : undefined}
      optionalLabel={optionalLabel}
      focusOnMount={focusOnMount}
    >
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-label={ariaLabel ?? question}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
        className="min-h-[9.5rem] resize-y sm:min-h-[11rem]"
        {...register(name)}
      />

      <div className="mt-2 flex items-start justify-between gap-3">
        <FieldError id={errorId} message={error} />
        {showCounter ? (
          <p className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {value.length.toLocaleString('es')} / {MAX_TEXT_LENGTH.toLocaleString('es')}
          </p>
        ) : null}
      </div>
    </StepShell>
  )
}
