import { describeIntensity, formatEmotionLabels } from '@/lib/emotions'
import type { JournalEntry } from '@/models/journal'

/**
 * Fuente única de verdad de las preguntas del journey. La usan el formulario,
 * el detalle del historial y el PDF, para que los textos nunca se desalineen.
 */
export const QUESTIONS = {
  situation: '¿Qué estabas haciendo o qué estaba pasando?',
  literalThought: '¿Qué empezaste a pensar?',
  feeling: '¿Qué sentiste?',
  emotion: 'Emociones experimentadas',
  intensity: 'Intensidad',
  reaction: '¿Qué hiciste cuando empezaste a pensar eso?',
  outcome: '¿Qué pasó después?',
} as const

export const STEPS = [
  { id: 'situation', shortName: 'Situación', question: QUESTIONS.situation },
  { id: 'thought', shortName: 'Pensamiento', question: QUESTIONS.literalThought },
  { id: 'emotion', shortName: 'Emoción', question: '¿Cómo te sentiste?' },
  { id: 'reaction', shortName: 'Conducta', question: QUESTIONS.reaction },
  { id: 'outcome', shortName: 'Resultado', question: QUESTIONS.outcome },
] as const

export type StepId = (typeof STEPS)[number]['id']
export const TOTAL_STEPS = STEPS.length

export const OUTCOME_PENDING_TEXT = 'Todavía sin completar'

export interface QuestionAnswer {
  question: string
  answer: string
  /** `true` cuando la respuesta está pendiente y no debe leerse como contenido. */
  pending: boolean
}

/**
 * Convierte una entrada en la lista ordenada de pregunta/respuesta que se
 * muestra en el historial y se imprime en el PDF.
 */
export function toQuestionAnswers(entry: JournalEntry): QuestionAnswer[] {
  const outcome = entry.outcome?.trim() ?? ''
  const hasOutcome = entry.isOutcomeComplete && outcome.length > 0

  return [
    { question: QUESTIONS.situation, answer: entry.situation, pending: false },
    { question: QUESTIONS.literalThought, answer: entry.literalThought, pending: false },
    { question: QUESTIONS.feeling, answer: entry.feeling, pending: false },
    { question: QUESTIONS.emotion, answer: formatEmotionLabels(entry), pending: false },
    {
      question: QUESTIONS.intensity,
      answer: `${entry.intensity}/10 (${describeIntensity(entry.intensity)})`,
      pending: false,
    },
    { question: QUESTIONS.reaction, answer: entry.reaction, pending: false },
    {
      question: QUESTIONS.outcome,
      answer: hasOutcome ? outcome : OUTCOME_PENDING_TEXT,
      pending: !hasOutcome,
    },
  ]
}
