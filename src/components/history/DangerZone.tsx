import { ShieldAlert, Trash2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteAllLocalData } from '@/db/entries'

/** Borrado total de los datos locales, con advertencia explícita. */
export function DangerZone({ entryCount }: { entryCount: number }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const confirm = async () => {
    setDeleting(true)
    try {
      await deleteAllLocalData()
      toast.success('Se eliminaron todos los datos locales')
      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos eliminar los datos de este dispositivo.'
      toast.error('No pudimos eliminar los datos', { description: message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert aria-hidden="true" className="size-4 text-destructive" />
          Eliminar todos los datos
        </CardTitle>
        <CardDescription>
          Borra de este dispositivo tus {entryCount === 1 ? 'entrada' : 'entradas'} y cualquier
          borrador en curso. No hay copia en ningún servidor, así que no se puede recuperar.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button variant="outline" onClick={() => setOpen(true)} className="text-destructive">
          <Trash2 aria-hidden="true" />
          Eliminar todos los datos locales
        </Button>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar todo lo guardado?</AlertDialogTitle>
              <AlertDialogDescription>
                Se van a borrar {entryCount === 1 ? '1 entrada' : `${entryCount} entradas`} y el
                borrador en curso de este dispositivo. <strong>La acción es irreversible</strong>: al
                no existir copias en ningún servidor, no hay forma de recuperar el contenido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault()
                  void confirm()
                }}
              >
                <Trash2 aria-hidden="true" />
                {deleting ? 'Eliminando…' : 'Sí, eliminar todo'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
