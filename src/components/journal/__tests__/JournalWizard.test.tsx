import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { JournalWizard } from '@/components/journal/JournalWizard'
import { db } from '@/db/db'
import { CURRENT_SCHEMA_VERSION, DRAFT_ID } from '@/models/journal'
import { makeFormValues } from '@/test/factories'
import { renderWithProviders } from '@/test/renderWithProviders'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

/** Espera a que termine la carga inicial del borrador. */
async function waitForWizard() {
  await waitFor(() =>
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument(),
  )
}

const continuar = () => screen.getByRole('button', { name: /continuar/i })

describe('validación del formulario', () => {
  it('no avanza y muestra el error cuando falta la situación', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JournalWizard />)
    await waitForWizard()

    await user.click(continuar())

    expect(
      await screen.findByText('Contanos qué estaba pasando para poder continuar.'),
    ).toBeInTheDocument()
    // Seguimos en el paso 1.
    expect(screen.getByText(/Paso.*1.*de.*5/s)).toBeInTheDocument()
  })

  it('exige el pensamiento antes de pasar a la emoción', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JournalWizard />)
    await waitForWizard()

    await user.type(
      screen.getByRole('textbox', { name: /qué estabas haciendo/i }),
      'Estaba en una reunión.',
    )
    await user.click(continuar())

    expect(
      await screen.findByRole('heading', { name: '¿Qué empezaste a pensar?' }),
    ).toBeInTheDocument()

    await user.click(continuar())
    expect(
      await screen.findByText('Escribí el pensamiento tal como apareció.'),
    ).toBeInTheDocument()
  })

  it('exige la emoción personalizada cuando se elige «Otra»', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JournalWizard />)
    await waitForWizard()

    await user.type(
      screen.getByRole('textbox', { name: /qué estabas haciendo/i }),
      'Una situación.',
    )
    await user.click(continuar())
    await user.type(
      await screen.findByRole('textbox', { name: /qué empezaste a pensar/i }),
      'Un pensamiento.',
    )
    await user.click(continuar())

    await user.type(
      await screen.findByRole('textbox', { name: /qué sentiste/i }),
      'Nudo en el estómago.',
    )
    await user.click(screen.getByRole('radio', { name: 'Otra' }))
    await user.click(continuar())

    expect(
      await screen.findByText('Escribí con qué nombre querés registrar esa emoción.'),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('¿Cómo la llamarías?'), 'desborde')
    await user.click(continuar())

    expect(
      await screen.findByRole('heading', {
        name: '¿Qué hiciste cuando empezaste a pensar eso?',
      }),
    ).toBeInTheDocument()
  })
})

describe('creación de una entrada', () => {
  it('recorre los cinco pasos, guarda y vuelve al paso 1 con el formulario limpio', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JournalWizard />)
    await waitForWizard()

    await user.type(
      screen.getByRole('textbox', { name: /qué estabas haciendo/i }),
      'Estaba por entrar a una reunión.',
    )
    await user.click(continuar())

    await user.type(
      await screen.findByRole('textbox', { name: /qué empezaste a pensar/i }),
      'Esto me va a salir mal.',
    )
    await user.click(continuar())

    await user.type(
      await screen.findByRole('textbox', { name: /qué sentiste/i }),
      'Se me cerró el pecho.',
    )
    await user.click(screen.getByRole('radio', { name: 'Ansiedad' }))
    await user.click(continuar())

    await user.type(
      await screen.findByRole('textbox', { name: /qué hiciste cuando empezaste/i }),
      'Postergué la reunión.',
    )
    await user.click(continuar())

    // El último paso es opcional: se puede guardar sin completarlo.
    expect(
      await screen.findByRole('heading', { name: '¿Qué pasó después?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /guardar entrada/i }))

    await waitFor(async () => expect(await db.entries.count()).toBe(1))

    const [entry] = await db.entries.toArray()
    expect(entry?.situation).toBe('Estaba por entrar a una reunión.')
    expect(entry?.literalThought).toBe('Esto me va a salir mal.')
    expect(entry?.feeling).toBe('Se me cerró el pecho.')
    expect(entry?.emotion).toBe('ansiedad')
    expect(entry?.intensity).toBe(5)
    expect(entry?.reaction).toBe('Postergué la reunión.')
    expect(entry?.isOutcomeComplete).toBe(false)

    // Volvemos al paso 1 con los campos vacíos y sin borrador pendiente.
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '¿Qué estabas haciendo o qué estaba pasando?' }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('textbox', { name: /qué estabas haciendo/i })).toHaveValue('')
    await waitFor(async () => expect(await db.drafts.count()).toBe(0))
  })
})

describe('restauración del borrador', () => {
  it('retoma el paso y el contenido guardados', async () => {
    await db.drafts.put({
      id: DRAFT_ID,
      updatedAt: new Date().toISOString(),
      step: 2,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      values: makeFormValues({
        situation: 'Lo que había empezado a escribir.',
        literalThought: '',
      }),
    })

    renderWithProviders(<JournalWizard />)

    // Arranca directamente en el paso 2, donde había quedado.
    expect(
      await screen.findByRole('heading', { name: '¿Qué empezaste a pensar?' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Retomamos donde habías dejado.')).toBeInTheDocument()

    // Y el paso 1 conserva lo escrito.
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /atrás/i }))

    expect(
      await screen.findByRole('textbox', { name: /qué estabas haciendo/i }),
    ).toHaveValue('Lo que había empezado a escribir.')
  })

  it('permite descartar el borrador y empezar de nuevo', async () => {
    await db.drafts.put({
      id: DRAFT_ID,
      updatedAt: new Date().toISOString(),
      step: 2,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      values: makeFormValues({ situation: 'Algo a medio escribir.' }),
    })

    const user = userEvent.setup()
    renderWithProviders(<JournalWizard />)

    await user.click(await screen.findByRole('button', { name: /empezar de nuevo/i }))

    expect(
      await screen.findByRole('textbox', { name: /qué estabas haciendo/i }),
    ).toHaveValue('')
    await waitFor(async () => expect(await db.drafts.count()).toBe(0))
  })
})
