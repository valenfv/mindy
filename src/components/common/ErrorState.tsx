import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title: string
  description: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/** Error explicado en lenguaje humano, con una salida clara. */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Volver a intentar',
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn('border-destructive/30 bg-destructive-soft/60 p-5 sm:p-6', className)}>
      <div className="flex gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex-1 space-y-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
