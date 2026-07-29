import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EntryAnswers } from '@/components/history/EntryAnswers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldError } from '@/components/ui/field-error'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { completeOutcome } from '@/db/entries'
import { formatDateTime } from '@/lib/dates'
import { QUESTIONS } from '@/lib/questions'
import type { JournalEntry } from '@/models/journal'
import { outcomeSchema, type OutcomeFormValues } from '@/schemas/journal'

interface CompleteOutcomeDialogProps {
  entry: JournalEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Completa el último paso de una entrada. Los pasos anteriores se muestran como
 * contexto de sólo lectura: desde el historial nunca se editan.
 */
export function CompleteOutcomeDialog({
  entry,
  open,
  onOpenChange,
}: CompleteOutcomeDialogProps) {
  const [saving, setSaving] = useState(false)

  const form = useForm<OutcomeFormValues>({
    resolver: zodResolver(outcomeSchema),
    defaultValues: { outcome: entry.outcome ?? '' },
  })

  // Cada apertura arranca con el valor guardado, sin arrastrar intentos previos.
  useEffect(() => {
    if (open) form.reset({ outcome: entry.outcome ?? '' })
  }, [open, entry.outcome, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      await completeOutcome(entry.id, values.outcome)
      toast.success('Entrada completada', {
        description: 'Ya quedó guardada con todas sus respuestas.',
      })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos guardar el cambio en este dispositivo.'
      toast.error('No pudimos completar la entrada', { description: message })
    } finally {
      setSaving(false)
    }
  })

  const error = form.formState.errors.outcome?.message

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="complete-outcome-description">
        <DialogHeader>
          <DialogTitle>Completar entrada</DialogTitle>
          <DialogDescription id="complete-outcome-description">
            Registrada el {formatDateTime(entry.createdAt)}. Sólo se puede completar la última
            pregunta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-6">
            <section aria-label="Respuestas ya registradas">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lo que registraste
              </h3>
              <div className="rounded-lg border border-border/70 bg-secondary/30 p-4">
                <EntryAnswers entry={entry} omitOutcome />
              </div>
            </section>

            <div className="space-y-2">
              <Label htmlFor="outcome-field">{QUESTIONS.outcome}</Label>
              <Textarea
                id="outcome-field"
                rows={5}
                autoFocus
                placeholder="Al día siguiente hablamos y…"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'outcome-field-error' : undefined}
                className="min-h-[7rem] resize-y"
                {...form.register('outcome')}
              />
              <FieldError id="outcome-field-error" message={error} />
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              <Check aria-hidden="true" />
              {saving ? 'Guardando…' : 'Guardar cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
