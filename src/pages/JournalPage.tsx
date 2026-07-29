import { useEffect } from 'react'
import { JournalWizard } from '@/components/journal/JournalWizard'
import { PrivacyNote } from '@/components/layout/PrivacyNote'

export default function JournalPage() {
  useEffect(() => {
    document.title = 'Mindy · Registrar una experiencia'
  }, [])

  return (
    <main className="container max-w-2xl py-6 sm:py-10">
      <h1 className="sr-only">Registrar una experiencia en Mindy</h1>

      <div className="mb-5 space-y-1.5">
        <p className="font-serif text-lg font-medium leading-snug sm:text-xl">
          Tomate un momento para registrar lo que pasó.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cinco preguntas cortas para ordenar la situación, el pensamiento, la emoción y lo que
          hiciste. Podés escribir con tus palabras: no hay respuestas correctas.
        </p>
      </div>

      <JournalWizard />

      <PrivacyNote className="mt-8" />
    </main>
  )
}
