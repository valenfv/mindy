import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import type { ComponentProps } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export function AlertDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/35 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      {/* Centrado en el contenedor: la animación usa `transform` y pisaría un
          `-translate-x-1/2` en el propio Content. */}
      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-3">
        <AlertDialogPrimitive.Content
          className={cn(
            'pointer-events-auto relative max-h-full w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lifted sm:p-6',
            'data-[state=open]:animate-step-in',
            className,
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Content>
      </div>
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn('font-serif text-lg font-semibold leading-snug', className)}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}

export function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants({ variant: 'destructive' }), className)}
      {...props}
    />
  )
}
