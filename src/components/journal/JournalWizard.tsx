import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, History } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { EmotionStep } from '@/components/journal/EmotionStep'
import { fieldsForStep } from '@/components/journal/stepFields'
import { Stepper } from '@/components/journal/Stepper'
import { TextareaStep } from '@/components/journal/TextareaStep'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clearDraft, EMPTY_FORM_VALUES, readDraft } from '@/db/drafts'
import { createEntry } from '@/db/entries'
import { useDraftAutosave } from '@/hooks/useDraftAutosave'
import { QUESTIONS, STEPS, TOTAL_STEPS } from '@/lib/questions'
import type { JournalFormValues } from '@/models/journal'
import { journalFormSchema } from '@/schemas/journal'

type LoadState = 'loading' | 'ready'

/**
 * Journey completo de registro. Un único formulario para los cinco pasos: la
 * validación se hace por paso con `trigger`, y el estado vive local porque
 * ninguna otra pantalla necesita leerlo.
 */
export function JournalWizard() {
  const navigate = useNavigate()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [step, setStep] = useState(1)
  const [draftRestored, setDraftRestored] = useState(false)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Evita mover el foco en el primer render; sólo al navegar entre pasos.
  const [hasNavigated, setHasNavigated] = useState(false)

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'onSubmit',
  })

  const autosave = useDraftAutosave({
    form,
    step,
    enabled: loadState === 'ready',
    onError: () => {
      setStorageWarning(
        'No pudimos guardar el borrador en este dispositivo. Si cerrás la aplicación ahora podrías perder lo escrito.',
      )
    },
  })

  // Recuperación del borrador al abrir la aplicación.
  useEffect(() => {
    let cancelled = false

    readDraft()
      .then((draft) => {
        if (cancelled) return
        if (draft) {
          form.reset(draft.values)
          setStep(draft.step)
          setDraftRestored(true)
        }
      })
      .catch(() => {
        if (cancelled) return
        setStorageWarning(
          'No pudimos leer lo que habías empezado a escribir en este dispositivo. Podés registrar una experiencia nueva sin problema.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoadState('ready')
      })

    return () => {
      cancelled = true
    }
  }, [form])

  const goToStep = useCallback(
    (next: number) => {
      setHasNavigated(true)
      setStep(Math.min(Math.max(next, 1), TOTAL_STEPS))
    },
    [],
  )

  const goNext = useCallback(async () => {
    const valid = await form.trigger(fieldsForStep(step))

    if (!valid) {
      // Foco en el primer campo con error del paso.
      const firstInvalid = fieldsForStep(step).find((field) => form.getFieldState(field).error)
      if (firstInvalid && firstInvalid !== 'intensity') {
        form.setFocus(firstInvalid)
      }
      return
    }

    if (step < TOTAL_STEPS) goToStep(step + 1)
  }, [form, step, goToStep])

  const goBack = useCallback(() => {
    if (step > 1) goToStep(step - 1)
  }, [step, goToStep])

  const saveEntry = useCallback(
    async (values: JournalFormValues) => {
      setSaving(true)
      // No queremos que un guardado de borrador pendiente reviva lo que ya se guardó.
      autosave.cancel()

      try {
        await createEntry(values)
        await clearDraft()

        form.reset(EMPTY_FORM_VALUES)
        setDraftRestored(false)
        setStorageWarning(null)
        setStep(1)
        setHasNavigated(false)

        toast.success('Entrada guardada correctamente', {
          description: 'Ya podés verla en tu historial.',
          action: {
            label: 'Ver historial',
            onClick: () => navigate('/historial'),
          },
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No pudimos guardar la entrada en este dispositivo.'
        toast.error('No pudimos guardar la entrada', { description: message })
      } finally {
        setSaving(false)
      }
    },
    [autosave, form, navigate],
  )

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (step < TOTAL_STEPS) {
        void goNext()
        return
      }
      void form.handleSubmit(saveEntry)()
    },
    [form, goNext, saveEntry, step],
  )

  if (loadState === 'loading') {
    return <LoadingScreen />
  }

  const isLastStep = step === TOTAL_STEPS
  const currentStepName = STEPS[step - 1]?.shortName ?? ''

  return (
    <FormProvider {...form}>
      <div className="space-y-3">
        <Card className="overflow-hidden">
          <div className="border-b border-border/70 bg-secondary/30 px-4 py-3 sm:px-6">
            <Stepper currentStep={step} />
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="p-4 sm:px-6 sm:py-5">
              {/* Anuncio del cambio de paso para lectores de pantalla. */}
              <p className="sr-only" aria-live="polite">
                Paso {step} de {TOTAL_STEPS}: {currentStepName}
              </p>

              {step === 1 ? (
                <TextareaStep
                  key="situation"
                  name="situation"
                  question={QUESTIONS.situation}
                  hint="Contá el momento con el detalle que te resulte cómodo: dónde estabas, con quién, qué estaba ocurriendo."
                  placeholder="Estaba por entrar a una reunión y me llegó un mensaje…"
                  focusOnMount={hasNavigated}
                />
              ) : null}

              {step === 2 ? (
                <TextareaStep
                  key="literalThought"
                  name="literalThought"
                  question={QUESTIONS.literalThought}
                  hint="Escribilo de la manera más literal posible, con las mismas palabras que aparecieron en tu cabeza."
                  placeholder="«Esto me va a salir mal y se van a dar cuenta»"
                  focusOnMount={hasNavigated}
                />
              ) : null}

              {step === 3 ? <EmotionStep key="emotion" focusOnMount={hasNavigated} /> : null}

              {step === 4 ? (
                <TextareaStep
                  key="reaction"
                  name="reaction"
                  question={QUESTIONS.reaction}
                  hint="Qué hiciste, qué dejaste de hacer, qué dijiste o cómo reaccionaste."
                  placeholder="Cancelé la reunión y me quedé mirando el teléfono…"
                  focusOnMount={hasNavigated}
                />
              ) : null}

              {step === 5 ? (
                <TextareaStep
                  key="outcome"
                  name="outcome"
                  question={QUESTIONS.outcome}
                  hint="Si todavía no lo sabés, podés guardar la entrada así y completar esta parte más adelante desde el historial."
                  placeholder="Al día siguiente hablamos y…"
                  optionalLabel="Se puede completar después"
                  rows={6}
                  focusOnMount={hasNavigated}
                />
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/70 bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={goBack} disabled={saving}>
                  <ArrowLeft aria-hidden="true" />
                  Atrás
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}

              {isLastStep ? (
                <Button type="submit" size="lg" disabled={saving}>
                  <Check aria-hidden="true" />
                  {saving ? 'Guardando…' : 'Guardar entrada'}
                </Button>
              ) : (
                <Button type="submit" size="lg">
                  Continuar
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
        </Card>

        {draftRestored ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/25 bg-primary-soft/50 p-3">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <History aria-hidden="true" className="size-4 shrink-0 text-primary" />
              Retomamos donde habías dejado.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                autosave.cancel()
                void clearDraft()
                form.reset(EMPTY_FORM_VALUES)
                setStep(1)
                setDraftRestored(false)
                setHasNavigated(false)
              }}
            >
              Empezar de nuevo
            </Button>
          </Card>
        ) : null}

        {storageWarning ? (
          <Card className="border-accent/30 bg-accent-soft/50 p-3">
            <p className="text-sm leading-relaxed text-accent-strong">{storageWarning}</p>
          </Card>
        ) : null}
      </div>
    </FormProvider>
  )
}
