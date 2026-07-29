import { toQuestionAnswers } from '@/lib/questions'
import { cn } from '@/lib/utils'
import type { JournalEntry } from '@/models/journal'

/**
 * Todas las preguntas y respuestas de una entrada, en modo lectura. Se usa en
 * el detalle expandido del historial y como contexto al completar el último
 * paso.
 */
export function EntryAnswers({
  entry,
  className,
  omitOutcome = false,
}: {
  entry: JournalEntry
  className?: string
  /** Oculta la última pregunta cuando se está editando justo esa. */
  omitOutcome?: boolean
}) {
  const answers = toQuestionAnswers(entry)
  const visible = omitOutcome ? answers.slice(0, -1) : answers

  return (
    <dl className={cn('space-y-4', className)}>
      {visible.map((item) => (
        <div key={item.question} className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">{item.question}</dt>
          <dd
            className={cn(
              'whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed',
              item.pending && 'italic text-accent-strong',
            )}
          >
            {item.answer}
          </dd>
        </div>
      ))}
    </dl>
  )
}
