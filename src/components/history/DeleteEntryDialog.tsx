import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteEntry } from '@/db/entries'
import { formatDateTime } from '@/lib/dates'
import type { JournalEntry } from '@/models/journal'

interface DeleteEntryDialogProps {
  entry: JournalEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Borrado de una entrada, siempre con confirmación explícita. */
export function DeleteEntryDialog({ entry, open, onOpenChange }: DeleteEntryDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const confirm = async () => {
    setDeleting(true)
    try {
      await deleteEntry(entry.id)
      toast.success('Entrada eliminada')
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos eliminar la entrada en este dispositivo.'
      toast.error('No pudimos eliminar la entrada', { description: message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta entrada?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a borrar la entrada del {formatDateTime(entry.createdAt)}. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              // Cerramos recién cuando el borrado terminó bien.
              event.preventDefault()
              void confirm()
            }}
          >
            <Trash2 aria-hidden="true" />
            {deleting ? 'Eliminando…' : 'Eliminar entrada'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
