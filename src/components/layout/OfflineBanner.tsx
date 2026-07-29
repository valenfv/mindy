import { CloudOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Aviso tranquilizador cuando no hay conexión: Mindy no necesita internet, así
 * que el mensaje explica que no se pierde nada.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div
      role="status"
      className="border-b border-accent-soft bg-accent-soft/70 px-4 py-2 text-center text-xs font-medium text-accent-strong"
    >
      <span className="inline-flex items-center gap-2">
        <CloudOff aria-hidden="true" className="size-3.5 shrink-0" />
        Estás sin conexión. Podés seguir escribiendo: todo se guarda en este dispositivo.
      </span>
    </div>
  )
}
