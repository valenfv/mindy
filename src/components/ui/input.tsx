import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-4 py-2 text-base shadow-sm transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
        // Espacio para el ícono del calendario, que va anclado a la derecha
        // (ver la regla de `input[type='date']` en index.css). `items-center`
        // recentra el texto: al sacarle la apariencia nativa para que el campo
        // pueda encogerse, iOS lo dibuja pegado al borde de arriba.
        type === 'date' && 'items-center pr-11',
        className,
      )}
      {...props}
    />
  )
}
