import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, PenLine, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { CompleteOutcomeDialog } from '@/components/history/CompleteOutcomeDialog'
import { DeleteEntryDialog } from '@/components/history/DeleteEntryDialog'
import { EntryAnswers } from '@/components/history/EntryAnswers'
import { OutcomeStatus } from '@/components/history/OutcomeStatus'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDateTime, formatRelativeDay } from '@/lib/dates'
import { describeIntensity, resolveEmotionLabel } from '@/lib/emotions'
import { canCompleteOutcome } from '@/db/entries'
import type { JournalEntry } from '@/models/journal'

/**
 * Tarjeta de una entrada del historial. Colapsada muestra fecha, situación,
 * emoción, intensidad y estado; expandida, todas las preguntas y respuestas.
 */
export function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const detailsId = useId()

  const relativeDay = formatRelativeDay(entry.createdAt)
  const editable = canCompleteOutcome(entry)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lifted">
      <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
            </h3>
            {relativeDay ? (
              <Badge variant="outline" className="translate-y-[-1px]">
                {relativeDay}
              </Badge>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
            {entry.situation}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{resolveEmotionLabel(entry)}</Badge>
            <Badge variant="outline">
              <span className="tabular-nums">{entry.intensity}/10</span>
              <span className="text-muted-foreground">· {describeIntensity(entry.intensity)}</span>
            </Badge>
            <OutcomeStatus complete={entry.isOutcomeComplete} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Collapsible.Trigger asChild>
              <Button variant="outline" size="sm" aria-controls={detailsId}>
                <ChevronDown
                  aria-hidden="true"
                  className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
                {expanded ? 'Ocultar detalle' : 'Ver detalle'}
              </Button>
            </Collapsible.Trigger>

            {editable ? (
              <Button variant="secondary" size="sm" onClick={() => setCompleting(true)}>
                <PenLine aria-hidden="true" />
                Completar entrada
              </Button>
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleting(true)}
              className="text-destructive hover:bg-destructive-soft hover:text-destructive sm:ml-auto"
            >
              <Trash2 aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Eliminar</span>
            </Button>
          </div>
        </div>

        <Collapsible.Content
          id={detailsId}
          className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
        >
          <div className="border-t border-border/70 bg-secondary/25 p-5 sm:p-6">
            <EntryAnswers entry={entry} />
            {entry.updatedAt !== entry.createdAt ? (
              <p className="mt-5 text-xs text-muted-foreground">
                Actualizada el {formatDateTime(entry.updatedAt)}.
              </p>
            ) : null}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      {editable ? (
        <CompleteOutcomeDialog entry={entry} open={completing} onOpenChange={setCompleting} />
      ) : null}
      <DeleteEntryDialog entry={entry} open={deleting} onOpenChange={setDeleting} />
    </Card>
  )
}
