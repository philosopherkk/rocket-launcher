import * as THREE from 'three'

function canvas(size: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, anisotropy = 4): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = anisotropy
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/** Lightweight procedural Earth map (not NASA imagery — educational stand-in). */
export function makeEarthTexture(size = 512): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, '#1a3d6e')
  g.addColorStop(0.5, '#1f6a9e')
  g.addColorStop(1, '#1a3d6e')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // Continent blobs
  const land = ['#2f7a45', '#3d8f52', '#276338', '#4a9a55']
  for (let i = 0; i < 55; i++) {
    ctx.fillStyle = land[i % land.length]
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * size
    const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * size
    const rx = 18 + (i % 7) * 10
    const ry = 12 + (i % 5) * 8
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, i * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Cloud wisps
  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 40; i++) {
    const x = ((i * 97) % size)
    const y = ((i * 53) % size)
    ctx.beginPath()
    ctx.ellipse(x, y, 40 + (i % 10) * 4, 8 + (i % 4) * 3, i, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Ice caps
  const polar = ctx.createLinearGradient(0, 0, 0, size)
  polar.addColorStop(0, 'rgba(230,240,255,0.85)')
  polar.addColorStop(0.12, 'rgba(230,240,255,0)')
  polar.addColorStop(0.88, 'rgba(230,240,255,0)')
  polar.addColorStop(1, 'rgba(230,240,255,0.85)')
  ctx.fillStyle = polar
  ctx.fillRect(0, 0, size, size)

  return toTexture(c)
}

export function makeEarthNormalHint(size = 256): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgb(${120 + (i % 20)}, ${120 + (i % 30)}, 255)`
    ctx.beginPath()
    ctx.arc((i * 37) % size, (i * 61) % size, 2 + (i % 4), 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = toTexture(c, 2)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

export function makeMoonTexture(size = 512): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#b7b2a8'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const shade = 140 + ((i * 17) % 70)
    ctx.fillStyle = `rgb(${shade},${shade - 4},${shade - 10})`
    const x = (i * 47) % size
    const y = (i * 91) % size
    const r = 1 + (i % 9)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // Larger maria
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = 'rgba(90,88,82,0.35)'
    ctx.beginPath()
    ctx.ellipse((i * 73) % size, (i * 101) % size, 30 + i * 3, 22 + i * 2, i, 0, Math.PI * 2)
    ctx.fill()
  }
  return toTexture(c)
}

export function makePlanetTexture(
  base: string,
  accent: string,
  size = 384,
  bands = false,
): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  if (bands) {
    for (let y = 0; y < size; y++) {
      const t = y / size
      const wobble = Math.sin(t * 40 + Math.sin(t * 8) * 2) * 0.08
      ctx.fillStyle = t + wobble > 0.5 ? base : accent
      // blend
      const mix = 0.5 + 0.5 * Math.sin(t * Math.PI * 14 + wobble * 8)
      ctx.fillStyle = mixColor(base, accent, mix)
      ctx.fillRect(0, y, size, 1)
    }
  } else {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.15 + (i % 5) * 0.05
      ctx.beginPath()
      ctx.ellipse((i * 59) % size, (i * 83) % size, 10 + (i % 20), 6 + (i % 12), i, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  return toTexture(c)
}

function mixColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a)
  const pb = hexToRgb(b)
  const r = Math.round(pa.r + (pb.r - pa.r) * t)
  const g = Math.round(pa.g + (pb.g - pa.g) * t)
  const bl = Math.round(pa.b + (pb.b - pa.b) * t)
  return `rgb(${r},${g},${bl})`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/** Dark heat-shield tile pattern for Starship windward side. */
export function makeTileTexture(size = 256): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#2c2620'
  ctx.fillRect(0, 0, size, size)
  const cell = 14
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const v = 38 + ((x * 13 + y * 7) % 28)
      ctx.fillStyle = `rgb(${v},${v - 6},${v - 12})`
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2)
    }
  }
  const tex = toTexture(c, 2)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 8)
  return tex
}

export function makeSteelTexture(size = 256): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  const g = ctx.createLinearGradient(0, 0, size, size)
  g.addColorStop(0, '#d5dce3')
  g.addColorStop(0.5, '#b7c0c9')
  g.addColorStop(1, '#c9d2db')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 200; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.02 + (i % 3) * 0.01})`
    ctx.beginPath()
    ctx.moveTo(0, (i * 17) % size)
    ctx.lineTo(size, (i * 17 + 40) % size)
    ctx.stroke()
  }
  return toTexture(c, 2)
}
