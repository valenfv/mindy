import { useFormContext, useWatch } from 'react-hook-form'
import { EMOTIONS } from '@/lib/emotions'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QUESTIONS } from '@/lib/questions'
import { MAX_CUSTOM_EMOTION_LENGTH } from '@/schemas/journal'
import type { JournalFormValues } from '@/models/journal'
import { cn } from '@/lib/utils'

/**
 * Selección de emoción como grupo de radios nativos con apariencia de chips.
 * Se eligió radio nativo en lugar de un combobox: el manejo de teclado y de
 * lectores de pantalla viene dado por el navegador, y en mobile las áreas
 * táctiles quedan más grandes que en una lista desplegable.
 */
export function EmotionField() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JournalFormValues>()

  const emotion = useWatch({ control, name: 'emotion' })
  const emotionError = errors.emotion?.message
  const customError = errors.customEmotion?.message

  return (
    <div className="space-y-3">
      <fieldset aria-describedby={emotionError ? 'emotion-error' : undefined}>
        <legend className="text-sm font-medium leading-snug">
          {QUESTIONS.emotion}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(obligatorio)</span>
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {EMOTIONS.map((option) => (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                value={option.id}
                aria-invalid={emotionError ? true : undefined}
                className="peer sr-only"
                {...register('emotion')}
              />
              <span
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border border-input bg-background px-4 text-sm transition-colors',
                  'hover:bg-secondary/60',
                  'peer-checked:border-primary peer-checked:bg-primary peer-checked:font-medium peer-checked:text-primary-foreground',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>

        <FieldError id="emotion-error" message={emotionError} className="mt-2" />
      </fieldset>

      {emotion === 'otra' ? (
        <div className="animate-fade-in space-y-2 motion-reduce:animate-none">
          <Label htmlFor="customEmotion">¿Cómo la llamarías?</Label>
          <Input
            id="customEmotion"
            maxLength={MAX_CUSTOM_EMOTION_LENGTH}
            autoComplete="off"
            placeholder="Por ejemplo: desborde"
            aria-invalid={customError ? true : undefined}
            aria-describedby={customError ? 'customEmotion-error' : undefined}
            {...register('customEmotion')}
          />
          <FieldError id="customEmotion-error" message={customError} />
        </div>
      ) : null}
    </div>
  )
}
