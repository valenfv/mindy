import { Controller, useFormContext } from 'react-hook-form'
import { describeIntensity, INTENSITY_REFERENCES } from '@/lib/emotions'
import { FieldError } from '@/components/ui/field-error'
import { Slider } from '@/components/ui/slider'
import { QUESTIONS } from '@/lib/questions'
import { cn } from '@/lib/utils'
import type { JournalFormValues } from '@/models/journal'

/**
 * Intensidad de 1 a 10. El número seleccionado siempre está visible y se
 * acompaña con una palabra («moderada», «muy intensa»…), así el estado no
 * depende sólo de la posición del control.
 */
export function IntensityField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<JournalFormValues>()

  const error = errors.intensity?.message

  return (
    <Controller
      control={control}
      name="intensity"
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium leading-snug" id="intensity-label">
                {QUESTIONS.intensity}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (obligatorio)
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {describeIntensity(field.value)}
              </p>
            </div>

            <p className="shrink-0 font-serif text-2xl font-semibold leading-none tabular-nums text-primary">
              {field.value}
              <span className="text-lg font-normal text-muted-foreground">/10</span>
            </p>
          </div>

          <Slider
            min={1}
            max={10}
            step={1}
            value={[field.value]}
            onValueChange={([next]) => field.onChange(next)}
            onBlur={field.onBlur}
            aria-labelledby="intensity-label"
            aria-valuetext={`${field.value} de 10, ${describeIntensity(field.value)}`}
            aria-describedby={error ? 'intensity-error' : 'intensity-references'}
          />

          <ul
            id="intensity-references"
            className="grid grid-cols-3 text-xs text-muted-foreground"
          >
            {INTENSITY_REFERENCES.map((reference, index) => (
              <li
                key={reference.value}
                className={cn(
                  'flex flex-col gap-0.5',
                  index === 0 && 'text-left',
                  index === 1 && 'text-center',
                  index === 2 && 'text-right',
                )}
              >
                <span className="font-medium tabular-nums text-foreground/70">
                  {reference.value}
                </span>
                <span>{reference.label}</span>
              </li>
            ))}
          </ul>

          <FieldError id="intensity-error" message={error} />
        </div>
      )}
    />
  )
}
