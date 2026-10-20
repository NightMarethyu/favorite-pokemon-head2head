// Draws the 3×3 favorites grid onto a canvas and returns it as a PNG blob.
// Colors and fonts come from the page's CSS variables, so the image matches
// the current theme and language.

const SIZE = 1080
const PAD = 40
const GAP = 20
const CELL = (SIZE - PAD * 2 - GAP * 2) / 3
const HEADER = 110
const FOOTER = 80
const HEIGHT = PAD + HEADER + CELL * 3 + GAP * 2 + FOOTER

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

// Shrinks text until it fits the width.
function fitFont(context, text, family, size, maxWidth) {
  let px = size
  context.font = `${px}px ${family}`
  while (px > 12 && context.measureText(text).width > maxWidth) {
    px -= 2
    context.font = `${px}px ${family}`
  }
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

/**
 * slots: nine entries of { sprite, name, id } or null.
 * title: the heading drawn above the grid.
 * credit: small text in the corner (the site's address).
 */
export async function renderGrid({ slots, title, credit, siteTitle }) {
  const colors = {
    bg: cssVar('--bg'),
    surface: cssVar('--surface'),
    border: cssVar('--border'),
    fg: cssVar('--fg'),
    muted: cssVar('--muted'),
    accent: cssVar('--accent'),
    titleFill: cssVar('--title-fill'),
    titleOutline: cssVar('--title-outline'),
    titleShadow: cssVar('--title-shadow'),
  }
  const fonts = {
    display: cssVar('--font-display'),
    accent: cssVar('--font-accent'),
    title: cssVar('--font-title'),
  }
  // Canvas text doesn't wait for web fonts, so load the ones it draws with.
  await Promise.all(
    [fonts.display, fonts.accent, fonts.title].map((family) =>
      document.fonts.load(`32px ${family}`, `${title}${siteTitle}0123456789`).catch(() => {}),
    ),
  )
  const images = await Promise.all(slots.map((slot) => (slot?.sprite ? loadImage(slot.sprite) : null)))

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'

  context.fillStyle = colors.bg
  context.fillRect(0, 0, SIZE, HEIGHT)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = colors.fg
  fitFont(context, title, fonts.display, 64, SIZE - PAD * 2)
  context.fillText(title, SIZE / 2, PAD + HEADER / 2 - 6)

  slots.forEach((slot, index) => {
    const x = PAD + (index % 3) * (CELL + GAP)
    const y = PAD + HEADER + Math.floor(index / 3) * (CELL + GAP)

    roundedRect(context, x, y, CELL, CELL, 14)
    context.fillStyle = colors.surface
    context.fill()
    context.lineWidth = 3
    context.strokeStyle = colors.border
    context.stroke()

    if (!slot) return

    const image = images[index]
    const art = CELL * 0.72
    if (image) context.drawImage(image, x + (CELL - art) / 2, y + 12, art, art)

    context.fillStyle = colors.muted
    context.textAlign = 'left'
    context.textBaseline = 'top'
    context.font = `22px ${fonts.accent}`
    context.fillText(String(slot.id).padStart(4, '0'), x + 12, y + 10)

    context.fillStyle = colors.fg
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    fitFont(context, slot.name, fonts.display, 38, CELL - 24)
    context.fillText(slot.name, x + CELL / 2, y + CELL - 38)
  })

  // The site's name, styled like its title, with its address beside it.
  const footerY = HEIGHT - FOOTER / 2 - 4
  context.textBaseline = 'middle'
  context.textAlign = 'left'
  context.font = `40px ${fonts.title}`
  context.lineJoin = 'round'
  context.lineWidth = 7
  context.strokeStyle = colors.titleOutline
  context.fillStyle = colors.titleShadow
  context.fillText(siteTitle, PAD + 2, footerY + 3)
  context.strokeText(siteTitle, PAD, footerY)
  context.fillStyle = colors.titleFill
  context.fillText(siteTitle, PAD, footerY)

  context.textAlign = 'right'
  context.fillStyle = colors.muted
  fitFont(context, credit, fonts.display, 26, SIZE / 2 - PAD)
  context.fillText(credit, SIZE - PAD, footerY)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
