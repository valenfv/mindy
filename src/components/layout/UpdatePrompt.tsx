import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/**
 * Aviso de actualización. Con `registerType: 'prompt'` la nueva versión no se
 * aplica sola: la persona decide cuándo recargar, para no perder lo que estaba
 * escribiendo.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lifted pb-safe"
    >
      <p className="text-sm font-medium">Hay una versión nueva de Mindy.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Tus entradas no se ven afectadas al actualizar.
      </p>
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={() => setNeedRefresh(false)}>
          Más tarde
        </Button>
        <Button size="sm" onClick={() => void updateServiceWorker(true)}>
          <RefreshCw aria-hidden="true" />
          Actualizar ahora
        </Button>
      </div>
    </div>
  )
}
