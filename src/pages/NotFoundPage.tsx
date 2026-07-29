import { PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="container flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <h1 className="text-2xl font-semibold">Esta pantalla no existe</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Puede que el enlace haya cambiado. Desde el inicio podés registrar una experiencia o entrar
        a tu historial.
      </p>
      <Link to="/" className={buttonVariants()}>
        <PenLine aria-hidden="true" />
        Ir al inicio
      </Link>
    </main>
  )
}
