import { zodResolver } from '@hookform/resolvers/zod'
import { FileDown, Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toDateInputValue } from '@/lib/dates'
import { buildExportData } from '@/pdf/buildExportData'
import { generateJournalPdf } from '@/pdf/generatePdf'
import { exportRangeSchema, type ExportRangeValues } from '@/schemas/export'
import type { JournalEntry } from '@/models/journal'

/** Rango por defecto: los últimos 30 días, incluyendo hoy. */
function defaultRange(): ExportRangeValues {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 29)
  return { from: toDateInputValue(start), to: toDateInputValue(today) }
}

export function ExportPanel({ entries }: { entries: readonly JournalEntry[] }) {
  const [generating, setGenerating] = useState(false)
  const [emptyRangeNotice, setEmptyRangeNotice] = useState<string | null>(null)

  const form = useForm<ExportRangeValues>({
    resolver: zodResolver(exportRangeSchema),
    defaultValues: defaultRange(),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setEmptyRangeNotice(null)
    setGenerating(true)

    try {
      const data = buildExportData({ entries, from: values.from, to: values.to })

      if (data.total === 0) {
        setEmptyRangeNotice(
          'No hay entradas registradas en ese rango de fechas. Probá ampliando las fechas.',
        )
        return
      }

      await generateJournalPdf(data)
      toast.success('PDF generado', {
        description: `${data.total === 1 ? '1 entrada' : `${data.total} entradas`} en ${data.fileName}.`,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos generar el PDF en este dispositivo.'
      toast.error('No pudimos generar el PDF', { description: message })
    } finally {
      setGenerating(false)
    }
  })

  const fromError = form.formState.errors.from?.message
  const toError = form.formState.errors.to?.message

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileDown aria-hidden="true" className="size-4 text-primary" />
          Exportar a PDF
        </CardTitle>
        <CardDescription>
          Elegí un rango de fechas. Ambos días quedan incluidos y el archivo se genera en este
          dispositivo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-from">Fecha desde</Label>
              <Input
                id="export-from"
                type="date"
                aria-invalid={fromError ? true : undefined}
                aria-describedby={fromError ? 'export-from-error' : undefined}
                {...form.register('from')}
              />
              <FieldError id="export-from-error" message={fromError} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-to">Fecha hasta</Label>
              <Input
                id="export-to"
                type="date"
                aria-invalid={toError ? true : undefined}
                aria-describedby={toError ? 'export-to-error' : undefined}
                {...form.register('to')}
              />
              <FieldError id="export-to-error" message={toError} />
            </div>
          </div>

          {emptyRangeNotice ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground"
            >
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {emptyRangeNotice}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={generating}>
              <FileDown aria-hidden="true" />
              {generating ? 'Generando…' : 'Exportar PDF'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Se incluyen las entradas completas y las que están pendientes.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
