import { MindyMark } from '@/components/brand/MindyMark'

/** Estado de carga de marca, consistente con la pantalla previa a montar React. */
export function LoadingScreen({ label = 'Abriendo tu diario…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 text-primary"
    >
      <MindyMark spinning className="size-16" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
