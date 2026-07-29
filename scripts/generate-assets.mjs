/**
 * Genera todos los assets rasterizados de Mindy a partir de los SVG originales
 * de `brand/`. Se ejecuta manualmente (`npm run icons`); los PNG resultantes
 * quedan versionados en `public/`, así el build y el runtime no dependen de
 * sharp ni de ninguna imagen remota.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const brandDir = path.join(root, 'brand')
const publicDir = path.join(root, 'public')
const iconsDir = path.join(publicDir, 'icons')
const splashDir = path.join(publicDir, 'splash')

const BRAND_BACKGROUND = '#faf7f1'

/** Iconos cuadrados con fondo propio: funcionan sobre claro y oscuro. */
const SQUARE_ICONS = [
  { source: 'icon.svg', size: 16, out: 'icons/favicon-16.png' },
  { source: 'icon.svg', size: 32, out: 'icons/favicon-32.png' },
  { source: 'icon.svg', size: 48, out: 'icons/favicon-48.png' },
  { source: 'icon.svg', size: 64, out: 'icons/icon-64.png' },
  { source: 'icon.svg', size: 180, out: 'apple-touch-icon.png' },
  { source: 'icon.svg', size: 192, out: 'icons/icon-192.png' },
  { source: 'icon.svg', size: 512, out: 'icons/icon-512.png' },
  { source: 'icon-maskable.svg', size: 192, out: 'icons/maskable-192.png' },
  { source: 'icon-maskable.svg', size: 512, out: 'icons/maskable-512.png' },
]

/**
 * Pantallas de inicio para iOS. Safari sólo las usa si coincide exactamente el
 * tamaño en píxeles del dispositivo, por eso se listan una por familia.
 */
const SPLASH_SCREENS = [
  { width: 1290, height: 2796, deviceWidth: 430, ratio: 3 },
  { width: 1179, height: 2556, deviceWidth: 393, ratio: 3 },
  { width: 1284, height: 2778, deviceWidth: 428, ratio: 3 },
  { width: 1170, height: 2532, deviceWidth: 390, ratio: 3 },
  { width: 1125, height: 2436, deviceWidth: 375, ratio: 3 },
  { width: 828, height: 1792, deviceWidth: 414, ratio: 2 },
  { width: 750, height: 1334, deviceWidth: 375, ratio: 2 },
  { width: 1536, height: 2048, deviceWidth: 768, ratio: 2 },
  { width: 1668, height: 2388, deviceWidth: 834, ratio: 2 },
  { width: 2048, height: 2732, deviceWidth: 1024, ratio: 2 },
]

async function renderSvg(sourceName, size) {
  const svg = await readFile(path.join(brandDir, sourceName))
  return sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function generateIcons() {
  for (const { source, size, out } of SQUARE_ICONS) {
    const buffer = await renderSvg(source, size)
    await writeFile(path.join(publicDir, out), buffer)
    console.log(`✓ ${out} (${size}×${size})`)
  }
}

async function generateFavicon() {
  // .ico multi-tamaño armado a mano (no requiere dependencias extra).
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(sizes.map((size) => renderSvg('icon.svg', size)))

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(sizes.length, 4)

  let offset = 6 + sizes.length * 16
  const directory = []
  pngs.forEach((png, index) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], 0)
    entry.writeUInt8(sizes[index] === 256 ? 0 : sizes[index], 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    directory.push(entry)
  })

  await writeFile(
    path.join(publicDir, 'favicon.ico'),
    Buffer.concat([header, ...directory, ...pngs]),
  )
  console.log('✓ favicon.ico (16, 32, 48)')
}

async function generateSplashScreens() {
  for (const { width, height } of SPLASH_SCREENS) {
    // El isotipo ocupa ~34% del lado menor: legible sin dominar la pantalla.
    const markSize = Math.round(Math.min(width, height) * 0.34)
    const mark = await renderSvg('mark-on-light.svg', markSize)

    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BRAND_BACKGROUND,
      },
    })
      .composite([{ input: mark, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toBuffer()

    await writeFile(path.join(splashDir, `apple-splash-${width}x${height}.png`), buffer)
    console.log(`✓ splash/apple-splash-${width}x${height}.png`)
  }
}

async function copyBrandSvgs() {
  await writeFile(
    path.join(publicDir, 'favicon.svg'),
    await readFile(path.join(brandDir, 'icon.svg')),
  )
  console.log('✓ favicon.svg')
}

/** Emite los <link> de splash para pegar en index.html. */
function printSplashLinks() {
  console.log('\n<!-- Pantallas de inicio de iOS -->')
  for (const { width, height, deviceWidth, ratio } of SPLASH_SCREENS) {
    const orientation = 'portrait'
    console.log(
      `<link rel="apple-touch-startup-image" media="screen and (device-width: ${deviceWidth}px) and (device-height: ${Math.round(
        height / ratio,
      )}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})" href="/splash/apple-splash-${width}x${height}.png" />`,
    )
  }
}

await mkdir(iconsDir, { recursive: true })
await mkdir(splashDir, { recursive: true })

await generateIcons()
await generateFavicon()
await generateSplashScreens()
await copyBrandSvgs()
printSplashLinks()

console.log('\nAssets generados en public/.')
