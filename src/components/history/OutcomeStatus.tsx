import { CircleCheck, CircleDashed } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * Estado del último paso. Combina icono + texto para no comunicar el estado
 * sólo con el color.
 */
export function OutcomeStatus({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <Badge variant="primary">
        <CircleCheck aria-hidden="true" />
        Completa
      </Badge>
    )
  }

  return (
    <Badge variant="accent">
      <CircleDashed aria-hidden="true" />
      Falta completar qué pasó después
    </Badge>
  )
}
