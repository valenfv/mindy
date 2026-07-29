import { useEffect, useMemo, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { saveDraft } from '@/db/drafts'
import { debounce } from '@/lib/utils'
import type { JournalFormValues } from '@/models/journal'

const AUTOSAVE_DELAY_MS = 700

interface UseDraftAutosaveOptions {
  form: UseFormReturn<JournalFormValues>
  step: number
  /** Se desactiva hasta terminar de cargar el borrador previo. */
  enabled: boolean
  onError?: (error: unknown) => void
}

export interface DraftAutosaveControls {
  /** Descarta el guardado pendiente (al persistir la entrada definitiva). */
  cancel: () => void
  /** Guarda ya mismo, sin esperar el debounce. */
  flush: () => void
}

/**
 * Autoguardado del borrador mientras la persona escribe.
 *
 * Se guarda con debounce en cada cambio de campo, de inmediato al cambiar de
 * paso, y también al ocultarse la pestaña (`pagehide`/`visibilitychange`), que
 * es el último momento fiable antes de que el navegador descarte la página en
 * mobile.
 */
export function useDraftAutosave({
  form,
  step,
  enabled,
  onError,
}: UseDraftAutosaveOptions): DraftAutosaveControls {
  const stepRef = useRef(step)
  const enabledRef = useRef(enabled)
  const onErrorRef = useRef(onError)

  stepRef.current = step
  enabledRef.current = enabled
  onErrorRef.current = onError

  const persist = useMemo(
    () => (values: JournalFormValues) => {
      if (!enabledRef.current) return
      saveDraft(values, stepRef.current).catch((error) => onErrorRef.current?.(error))
    },
    [],
  )

  const debouncedPersist = useMemo(() => debounce(persist, AUTOSAVE_DELAY_MS), [persist])

  // Cambios de campo.
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      // `name` viene indefinido en resets programáticos, que no hay que guardar.
      if (!name) return
      debouncedPersist(values as JournalFormValues)
    })
    return () => subscription.unsubscribe()
  }, [form, debouncedPersist])

  // Cambio de paso: se guarda al instante para no perder la posición.
  useEffect(() => {
    if (!enabled) return
    debouncedPersist.cancel()
    persist(form.getValues())
  }, [step, enabled, form, persist, debouncedPersist])

  // Último guardado antes de que el navegador descarte la página.
  useEffect(() => {
    const flushNow = () => {
      debouncedPersist.cancel()
      persist(form.getValues())
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushNow()
    }

    window.addEventListener('pagehide', flushNow)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', flushNow)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      flushNow()
    }
  }, [form, persist, debouncedPersist])

  return useMemo(
    () => ({
      cancel: () => debouncedPersist.cancel(),
      flush: () => {
        debouncedPersist.cancel()
        persist(form.getValues())
      },
    }),
    [debouncedPersist, persist, form],
  )
}
