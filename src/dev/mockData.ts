import { db, toStorageError } from '@/db/db'
import { EMOTIONS } from '@/lib/emotions'
import { createId } from '@/lib/utils'
import {
  CURRENT_SCHEMA_VERSION,
  type EmotionId,
  type EmotionIntensity,
  type JournalEntry,
} from '@/models/journal'

/**
 * Datos de prueba para el historial. Sólo se carga en desarrollo (ver
 * `main.tsx`): en el build de producción la rama que lo importa se elimina, así
 * que este módulo no llega a las personas que usan la aplicación.
 *
 * Uso en la consola del navegador:
 *   await mindyMock.seed()      // 50 entradas random
 *   await mindyMock.seed(120)   // la cantidad que quieras
 *   await mindyMock.clear()     // borra sólo las entradas de prueba
 *   await mindyMock.reset(50)   // borra las de prueba y genera de nuevo
 */

/** Prefijo del id: permite borrar sólo lo generado y no las entradas reales. */
const MOCK_ID_PREFIX = 'mock-'

const SITUATIONS = [
  'Estaba por entrar a una reunión con el equipo y me llegó un mensaje del jefe pidiendo hablar «un minuto».',
  'Le escribí a una amiga hace tres días y todavía no me contestó.',
  'Me tocó presentar el avance del proyecto delante de gente que no conozco.',
  'Volví a casa y estaba todo desordenado, después de un día largo.',
  'Vi en redes que un grupo de conocidos se juntó y no me habían invitado.',
  'Me equivoqué con un número en un reporte que ya había mandado.',
  'Estaba en el colectivo camino al trabajo y de golpe se me aceleró el corazón.',
  'Tenía que llamar al banco por un problema con una factura y lo estuve pateando toda la semana.',
  'Mi pareja me hizo un comentario sobre algo que dije en la cena.',
  'Me desperté a las cuatro de la mañana y no pude volver a dormirme.',
  'Estaba entrenando y no pude terminar la rutina que venía haciendo sin problema.',
  'Terminé una entrevista de trabajo y me quedé repasando todo lo que dije.',
  'Un cliente respondió un mail mío con una sola palabra.',
  'Estaba cocinando para varias personas y se me quemó la comida.',
  'Me crucé con alguien del trabajo anterior en el supermercado.',
]

const THOUGHTS = [
  '«Esto me va a salir mal y se van a dar cuenta.»',
  '«Seguro se enojó conmigo por algo que dije.»',
  '«No estoy a la altura de esto.»',
  '«Si no lo hago perfecto no sirve para nada.»',
  '«Siempre termino arruinando lo mismo.»',
  '«No le importo a nadie realmente.»',
  '«Me va a pasar algo, algo está mal.»',
  '«Van a descubrir que no sé lo que estoy haciendo.»',
  '«Debería poder manejar esto sin ponerme así.»',
  '«Nunca voy a poder cambiar esto.»',
  '«Es mi culpa que las cosas salieran así.»',
  '«Se están riendo de mí por dentro.»',
]

const FEELINGS = [
  'Se me cerró el pecho y me costaba respirar. Las manos frías.',
  'Un peso en el estómago, como si algo malo estuviera por pasar.',
  'Calor en la cara y ganas de irme de ahí.',
  'Cansancio de golpe, el cuerpo sin fuerza.',
  'Tensión en la mandíbula y los hombros, no me daba cuenta hasta que lo noté.',
  'Un vacío en la panza y ganas de llorar sin motivo claro.',
  'El corazón muy rápido y la cabeza llena de ruido.',
  'Inquietud en las piernas, no podía quedarme quieto.',
  'Una especie de alivio raro, mezclado con culpa.',
  'Nudo en la garganta y la respiración corta.',
]

const REACTIONS = [
  'Cancelé la reunión y me quedé mirando el teléfono un rato largo.',
  'Contesté cortante y después me arrepentí.',
  'Me puse a ordenar cosas que no hacía falta ordenar para no pensar.',
  'Salí a caminar veinte minutos sin destino.',
  'Reescribí el mensaje seis veces antes de mandarlo.',
  'No hice nada, me quedé en la cama mirando el techo.',
  'Le pedí a un compañero que me ayudara a revisarlo.',
  'Empecé a comer sin hambre, casi en automático.',
  'Respiré despacio y esperé antes de responder.',
  'Me fui al baño a llorar y volví como si nada.',
  'Me puse los auriculares y seguí trabajando en piloto automático.',
  'Le conté a mi hermana lo que estaba pasando.',
]

const OUTCOMES = [
  'Al día siguiente hablamos y era por un tema administrativo, nada de lo que estaba imaginando.',
  'Me contestó dos días después: había estado con gripe. No tenía nada que ver conmigo.',
  'La presentación salió bien y hasta me hicieron preguntas interesadas.',
  'Al final lo hablamos con calma y quedamos bien.',
  'Corregí el número y nadie lo había notado todavía. Se resolvió en cinco minutos.',
  'Me tomé el resto del día tranquilo y a la noche ya lo veía más chico.',
  'No pasó nada de lo que había anticipado.',
  'Terminó siendo una charla incómoda pero necesaria, y me dejó más liviano.',
  'Llamé al banco y me lo resolvieron en la primera llamada.',
  'Todavía me quedó el malestar unos días, pero se fue apagando solo.',
]

const CUSTOM_EMOTIONS = ['Desborde', 'Impotencia', 'Nostalgia', 'Vacío', 'Incertidumbre']

const EMOTION_IDS_WITHOUT_OTHER = EMOTIONS.map((emotion) => emotion.id).filter(
  (id): id is EmotionId => id !== 'otra',
)

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(values: readonly T[]): T {
  return values[randomInt(0, values.length - 1)]
}

/** Una entrada random fechada `daysAgo` días atrás, a una hora cualquiera. */
function randomEntry(daysAgo: number, index: number): JournalEntry {
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)
  createdAt.setHours(randomInt(7, 23), randomInt(0, 59), randomInt(0, 59), 0)

  // Entre una y tres emociones de la lista, sin repetir, más «Otra» una de cada
  // ocho veces: así la UI se ve con una sola emoción y con varias.
  const useCustom = randomInt(1, 8) === 1
  const picked = new Set<EmotionId>()
  for (let i = randomInt(1, 3); i > 0; i -= 1) {
    picked.add(pick(EMOTION_IDS_WITHOUT_OTHER))
  }
  if (useCustom) picked.add('otra')
  const emotions = [...picked]

  // Las entradas más viejas suelen estar completas; las de los últimos días, no.
  const complete = daysAgo > 3 ? randomInt(1, 10) <= 7 : randomInt(1, 10) <= 2

  return {
    id: `${MOCK_ID_PREFIX}${index}-${createId()}`,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    situation: pick(SITUATIONS),
    literalThought: pick(THOUGHTS),
    feeling: pick(FEELINGS),
    emotions,
    ...(useCustom ? { customEmotion: pick(CUSTOM_EMOTIONS) } : {}),
    intensity: randomInt(1, 10) as EmotionIntensity,
    reaction: pick(REACTIONS),
    ...(complete ? { outcome: pick(OUTCOMES) } : {}),
    isOutcomeComplete: complete,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }
}

export interface MockDataTools {
  seed: (count?: number) => Promise<number>
  clear: () => Promise<number>
  reset: (count?: number) => Promise<number>
}

/** Genera `count` entradas repartidas en los últimos ~90 días. */
async function seed(count = 50): Promise<number> {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('La cantidad tiene que ser un entero mayor a 0.')
  }

  // Días distintos y desordenados: así el historial no queda con dos entradas
  // por día ni ordenado por casualidad.
  const spread = Math.max(90, count * 2)
  const daysAgo = Array.from({ length: count }, () => randomInt(0, spread))
  const entries = daysAgo.map((days, index) => randomEntry(days, index))

  try {
    await db.entries.bulkAdd(entries)
  } catch (error) {
    throw toStorageError(error)
  }

  console.info(
    `[mindyMock] ${entries.length} entradas generadas. Total en la base: ${await db.entries.count()}.`,
  )
  return entries.length
}

/** Borra únicamente las entradas generadas por `seed`. */
async function clear(): Promise<number> {
  try {
    const ids = (await db.entries.toCollection().primaryKeys()).filter((id) =>
      id.startsWith(MOCK_ID_PREFIX),
    )
    await db.entries.bulkDelete(ids)
    console.info(`[mindyMock] ${ids.length} entradas de prueba borradas.`)
    return ids.length
  } catch (error) {
    throw toStorageError(error)
  }
}

async function reset(count = 50): Promise<number> {
  await clear()
  return seed(count)
}

/**
 * Publica `window.mindyMock`. Idempotente: con el StrictMode de React y el HMR
 * de Vite esto puede ejecutarse más de una vez.
 */
export function installMockDataTools(): MockDataTools {
  const tools: MockDataTools = { seed, clear, reset }
  window.mindyMock = tools

  console.info(
    '[mindyMock] Disponible: mindyMock.seed(50), mindyMock.clear(), mindyMock.reset(50)',
  )

  return tools
}

declare global {
  interface Window {
    mindyMock?: MockDataTools
  }
}
