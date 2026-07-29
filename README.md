# Mindy

Diario guiado de pensamientos, emociones y conductas. Registrás una situación siguiendo cinco
preguntas cortas y podés volver a leerla, completarla y exportarla cuando quieras.

**Todo queda en tu dispositivo.** No hay backend, ni cuentas, ni analítica, ni envío de datos a
ningún servidor. La aplicación funciona offline y se puede instalar como PWA.

---

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Queda disponible en `http://localhost:5173`.

> El service worker está desactivado en desarrollo a propósito, para no servir versiones cacheadas
> mientras editás. Para probar la PWA de verdad, usá el build (ver más abajo).

## Correr los tests

```bash
npm test          # una pasada
npm run test:watch # modo interactivo
```

Los tests cubren las partes críticas:

| Archivo | Qué verifica |
| --- | --- |
| `src/schemas/__tests__/journal.test.ts` | Validaciones del formulario, incluida la regla condicional de «Otra» |
| `src/db/__tests__/entries.test.ts` | Creación de entradas, permisos de edición, borrado y datos corruptos |
| `src/db/__tests__/drafts.test.ts` | Guardado parcial, borrador único y restauración |
| `src/lib/__tests__/dates.test.ts` | Filtrado por rango de fechas inclusivo en zona horaria local |
| `src/pdf/__tests__/buildExportData.test.ts` | Datos que alimentan el PDF |
| `src/pdf/__tests__/winAnsi.test.ts` | Caracteres del español en el PDF |
| `src/components/journal/__tests__/JournalWizard.test.tsx` | Journey completo de punta a punta sobre IndexedDB |

## Generar el build

```bash
npm run build
```

Corre `tsc -b` (chequeo de tipos) y después `vite build`. La salida queda en `dist/`.

## Previsualizar la PWA

```bash
npm run build
npm run preview
```

Abrí la URL que imprime el comando (por defecto `http://localhost:4173`). Recién en el build está
activo el service worker, así que es la única forma de probar instalación, offline y aviso de
actualización.

Para comprobar que quedó bien instalable, en Chrome abrí **DevTools → Application**:

- **Manifest**: nombre, iconos y colores.
- **Service Workers**: debe figurar uno activo.
- En la barra de direcciones aparece el ícono de instalar.

## Regenerar los íconos

Los PNG de `public/` están versionados, así que normalmente no hace falta. Si cambiás los SVG de
`brand/`:

```bash
npm run icons
```

El script rasteriza con `sharp` los íconos PWA, los maskable, el favicon `.ico`, el Apple Touch Icon
y las pantallas de inicio de iOS, y además imprime los `<link>` de splash para `index.html`.

---

## Dónde se almacenan los datos

Todo vive en **IndexedDB**, en una base llamada `mindy`, gestionada con Dexie:

- **`entries`** — las entradas del diario.
- **`drafts`** — un único borrador activo (`id: 'active'`) con lo que estás escribiendo y el paso en
  el que quedaste.

La preferencia de tema clara/oscura es lo único que se guarda en `localStorage`
(`mindy:theme`). No se usan cookies.

Para verlo con tus propios ojos: **DevTools → Application → IndexedDB → mindy**.

### Limitaciones del almacenamiento local

Vale la pena tenerlas claras, porque no hay copia en ningún servidor:

- **Los datos son por navegador y por dispositivo.** Lo que registrás en el teléfono no aparece en la
  computadora, y Chrome no comparte datos con Safari.
- **Borrar los datos del sitio borra el diario.** «Borrar datos de navegación», limpiar el sitio desde
  la configuración del navegador o desinstalar la PWA en algunos sistemas elimina IndexedDB.
- **En navegación privada no persiste.** Al cerrar la ventana se descarta todo.
- **El navegador puede desalojar los datos.** Si el dispositivo se queda sin espacio, los sitios sin
  «almacenamiento persistente» concedido pueden ser limpiados. En la práctica es poco frecuente con
  volúmenes de texto como los de un diario.
- **iOS es más agresivo:** Safari puede borrar el almacenamiento de sitios que no se visitan durante
  semanas. Instalar Mindy en la pantalla de inicio reduce bastante ese riesgo.
- **No hay recuperación.** Si borrás una entrada o usás «Eliminar todos los datos locales», no se
  puede deshacer. El PDF exportado es la forma de conservar una copia fuera de la app.
- **Cuota**: el límite lo define el navegador (habitualmente un porcentaje del disco libre). Si se
  llena, Mindy avisa con un mensaje claro en lugar de fallar en silencio.

## Cómo comprobar el modo offline

1. `npm run build && npm run preview`.
2. Abrí la aplicación y navegá una vez por el inicio y por `/historial` (así el service worker termina
   de instalarse).
3. En **DevTools → Network**, marcá **Offline**. O directamente cortá el wifi.
4. Recargá. La app tiene que abrir igual, mostrar tus entradas, dejarte registrar una nueva y
   exportar el PDF.
5. Aparece además un aviso arriba explicando que estás sin conexión y que no se pierde nada.

En un dispositivo instalado, alcanza con activar el modo avión y abrir Mindy.

## Cómo instalar la aplicación

### Android (Chrome, Edge, Samsung Internet)

1. Abrí Mindy en el navegador.
2. Aceptá el aviso **«Instalar aplicación»**, o entrá al menú **⋮ → Instalar aplicación / Agregar a
   la pantalla principal**.
3. Queda como una app más, con su ícono y sin barra de navegador.

### iOS y iPadOS (Safari)

En iOS la instalación es siempre manual: Safari no muestra aviso automático.

1. Abrí Mindy **en Safari** (Chrome en iOS no puede instalar PWAs).
2. Tocá el botón **Compartir** (el cuadrado con la flecha).
3. Elegí **«Agregar a inicio»**.
4. Confirmá el nombre y tocá **Agregar**.

Al abrirla desde la pantalla de inicio arranca en pantalla completa, con la pantalla de carga de
marca y respetando las safe areas de los dispositivos con notch o isla dinámica.

### Escritorio (Chrome, Edge)

Ícono de instalar en la barra de direcciones, o menú **⋮ → Instalar Mindy**.

---

## Arquitectura

```
brand/                     SVG originales del isotipo (fuente de los íconos)
scripts/generate-assets.mjs Rasterizado de íconos y splash screens con sharp
public/                    Íconos, favicon, splash screens (generados, versionados)

src/
├── components/
│   ├── brand/             Isotipo y logotipo como componentes
│   ├── common/            ErrorBoundary, estados de carga y de error
│   ├── history/           Historial: tarjetas, edición, borrado, exportación
│   ├── journal/           Journey por pasos: stepper, pasos y campos
│   ├── layout/            Navbar, shell, avisos de offline y actualización
│   └── ui/                Primitivas estilo shadcn/ui (Radix + Tailwind + CVA)
├── db/                    Acceso a IndexedDB: db, entries, drafts
├── hooks/                 useEntries, useDraftAutosave, useTheme, useOnlineStatus
├── lib/                   Fechas, emociones, preguntas, utilidades
├── models/                Tipos del dominio y versión del esquema
├── pages/                 JournalPage, HistoryPage, NotFoundPage
├── pdf/                   Datos del documento (puro) y generación con jsPDF
├── schemas/               Validaciones Zod del formulario y de la exportación
└── test/                  Factories y helpers de test
```

### Decisiones técnicas

**Dexie para IndexedDB.** Da tipado, migraciones versionadas (`schemaVersion` en cada registro) y,
con `dexie-react-hooks`, un `useLiveQuery` que reactiva el historial al guardar, completar o borrar
sin recargar la página y sin necesidad de un store global.

**jsPDF para el PDF.** Genera el documento íntegramente en memoria, sin red. Sus fuentes base usan
codificación WinAnsi, que cubre por completo el español (tildes, `ñ`, `ü`, `¿`, `¡`) y los signos
tipográficos habituales, sin tener que empaquetar una fuente. Se importa de forma dinámica para que
sus ~360 kB no entren en la carga inicial; el service worker precachea el chunk, así que la
exportación también funciona offline. Los caracteres que la fuente no puede dibujar (por ejemplo
emojis) se reemplazan por `?`, para que la pérdida sea visible en lugar de generar un PDF roto.

**Un solo formulario para los cinco pasos.** React Hook Form maneja todo el journey y la validación
se hace por paso con `trigger(camposDelPaso)`. Todas las reglas viven en un único `superRefine`: en
Zod los refinamientos de objeto sólo corren si el parseo base tuvo éxito, así que si las
obligatoriedades estuvieran en cada campo, un campo vacío impediría evaluar la regla condicional de
«Otra» → emoción personalizada.

**Estado local, no global.** El paso actual y el borrador viven en el componente del journey; el
historial se lee directo de Dexie. El único contexto es el del tema.

### Decisiones de producto

Donde el pedido dejaba margen, se resolvió así:

- **La emoción se elige con chips de radio nativos**, no con un desplegable: mejores áreas táctiles
  en mobile y el manejo de teclado y lectores de pantalla lo da el navegador.
- **Al cambiar de paso el foco va al encabezado de la pregunta**, no al campo. Los lectores de
  pantalla anuncian la pregunta nueva y en el teléfono no se abre el teclado de golpe. El campo queda
  a un Tab.
- **Enter avanza de paso** (y guarda en el último). En los textarea, Enter sigue insertando saltos de
  línea.
- **Completar una entrada exige escribir algo.** Guardar un «qué pasó después» vacío dejaría la
  entrada marcada como completa sin contenido.
- **Se puede volver a un paso anterior desde el stepper**, pero sólo a los ya completados.
- **El rango de exportación arranca en los últimos 30 días**, el caso más habitual.
- **Los registros ilegibles no rompen el historial**: se cuentan, se avisa cuántos hay y se excluyen
  de la lista y del PDF; el resto de las entradas se muestra normalmente.
- **La actualización de la app se avisa, no se aplica sola** (`registerType: 'prompt'`), para no
  recargar la página mientras alguien está escribiendo.
- **Las splash screens de iOS se generan sólo en variante clara.** Safari no resuelve de forma
  confiable `prefers-color-scheme` en `apple-touch-startup-image`, y duplicar diez imágenes por un
  resultado incierto no se justifica.

## Privacidad

- No hay backend, ni autenticación, ni integraciones externas.
- No hay analytics, trackers, cookies publicitarias ni telemetría.
- No se cargan fuentes, imágenes ni scripts remotos: todos los assets son locales.
- `index.html` declara `noindex` y `referrer: no-referrer`.
- En el historial podés eliminar entradas de a una, o borrar todos los datos locales. Las dos
  acciones piden confirmación explícita.

## Accesibilidad

HTML semántico, labels asociados a todos los campos, navegación completa con teclado, foco visible,
errores anunciables (`role="alert"`), contraste suficiente en ambos temas, slider operable con
teclado, áreas táctiles de al menos 44 px, estados comunicados con icono + texto (nunca sólo con
color), enlace «saltar al contenido» y soporte de `prefers-reduced-motion`.

## Stack

React 19 · TypeScript · Vite 5 · React Router 7 · Dexie 4 · React Hook Form · Zod · Radix UI ·
Tailwind CSS · sonner · jsPDF · vite-plugin-pwa · Vitest + Testing Library
