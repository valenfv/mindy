import { PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MindyMark } from '@/components/brand/MindyMark'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** Estado vacío del historial, con la salida obvia hacia el journey. */
export function EmptyHistory() {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <MindyMark className="size-14 text-primary/40" />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Todavía no agregaste ninguna entrada.</h2>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          Cuando registres una experiencia vas a poder volver a leerla acá, completar lo que quedó
          pendiente y exportar tu diario en PDF.
        </p>
      </div>
      <Link to="/" className={buttonVariants({ size: 'lg' })}>
        <PenLine aria-hidden="true" />
        Registrar una experiencia
      </Link>
    </Card>
  )
}
