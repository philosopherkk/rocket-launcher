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

/**
 * Procedural Earth stand-in (not NASA photogrammetry).
 * Ocean albedo, land contrast, ice caps — educational atmosphere cue via separate cloud map.
 */
export function makeEarthTexture(size = 512): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, '#0d2a52')
  g.addColorStop(0.22, '#145a8a')
  g.addColorStop(0.5, '#1a6fa0')
  g.addColorStop(0.78, '#145a8a')
  g.addColorStop(1, '#0d2a52')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // Deep basins
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = '#0a3d6a'
    ctx.beginPath()
    ctx.ellipse(
      ((i * 131) % size),
      ((i * 97) % size),
      40 + (i % 8) * 12,
      28 + (i % 6) * 8,
      i * 0.3,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Continents — higher albedo contrast vs ocean
  const land = ['#2a6b38', '#3a8648', '#245830', '#4a9455', '#6b8f4a']
  const blobs = [
    [0.18, 0.42, 90, 55],
    [0.32, 0.38, 70, 100],
    [0.55, 0.45, 110, 48],
    [0.72, 0.4, 80, 70],
    [0.85, 0.52, 55, 40],
    [0.42, 0.62, 45, 35],
    [0.22, 0.72, 50, 28],
  ] as const
  for (let i = 0; i < blobs.length; i++) {
    const [fx, fy, rx, ry] = blobs[i]
    ctx.fillStyle = land[i % land.length]
    ctx.beginPath()
    ctx.ellipse(fx * size, fy * size, rx * (size / 512), ry * (size / 512), i * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = land[i % land.length]
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * size
    const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * size
    ctx.beginPath()
    ctx.ellipse(x, y, 14 + (i % 7) * 8, 10 + (i % 5) * 6, i * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Deserts / high albedo patches
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#c2a66a'
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.ellipse(((i * 67 + 40) % size), ((i * 41 + 120) % size), 18, 10, i, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Ice caps
  const polar = ctx.createLinearGradient(0, 0, 0, size)
  polar.addColorStop(0, 'rgba(235,245,255,0.92)')
  polar.addColorStop(0.1, 'rgba(235,245,255,0)')
  polar.addColorStop(0.9, 'rgba(235,245,255,0)')
  polar.addColorStop(1, 'rgba(235,245,255,0.92)')
  ctx.fillStyle = polar
  ctx.fillRect(0, 0, size, size)

  return toTexture(c)
}

/** Separate translucent cloud layer (not baked into land map). */
export function makeCloudTexture(size = 512): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 70; i++) {
    const x = (i * 97 + 13) % size
    const y = (i * 53 + 29) % size
    ctx.globalAlpha = 0.12 + (i % 5) * 0.04
    ctx.beginPath()
    ctx.ellipse(x, y, 36 + (i % 12) * 5, 7 + (i % 5) * 3, i * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  const tex = toTexture(c)
  tex.premultiplyAlpha = true
  return tex
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

/** Greyscale lunar surface with darker maria basins. */
export function makeMoonTexture(size = 512): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  const base = ctx.createLinearGradient(0, 0, size, size)
  base.addColorStop(0, '#c4bfb6')
  base.addColorStop(0.5, '#b0aaa0')
  base.addColorStop(1, '#a8a298')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Highlands noise
  for (let i = 0; i < 1200; i++) {
    const shade = 150 + ((i * 17) % 60)
    ctx.fillStyle = `rgb(${shade},${shade - 2},${shade - 8})`
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.arc((i * 47) % size, (i * 91) % size, 1 + (i % 8), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Maria — darker greyscale basins (Oceanus Procellarum–class cues)
  const maria = [
    [0.28, 0.4, 70, 48, 0.42],
    [0.55, 0.38, 55, 40, 0.38],
    [0.42, 0.55, 45, 32, 0.35],
    [0.68, 0.52, 38, 28, 0.32],
    [0.35, 0.62, 30, 22, 0.3],
  ] as const
  for (const [fx, fy, rx, ry, a] of maria) {
    ctx.fillStyle = `rgba(72,70,66,${a})`
    ctx.beginPath()
    ctx.ellipse(fx * size, fy * size, rx * (size / 512), ry * (size / 512), 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Craters
  for (let i = 0; i < 80; i++) {
    const x = (i * 73) % size
    const y = (i * 101) % size
    const r = 3 + (i % 12)
    ctx.strokeStyle = 'rgba(60,58,54,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(200,195,185,0.12)'
    ctx.beginPath()
    ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.55, 0, Math.PI * 2)
    ctx.fill()
  }

  return toTexture(c)
}

export function makePlanetTexture(
  base: string,
  accent: string,
  size = 384,
  bands = false,
  variant?: 'mars',
): THREE.CanvasTexture {
  const { c, ctx } = canvas(size)
  if (bands) {
    for (let y = 0; y < size; y++) {
      const t = y / size
      const wobble = Math.sin(t * 40 + Math.sin(t * 8) * 2) * 0.08
      const mix = 0.5 + 0.5 * Math.sin(t * Math.PI * 14 + wobble * 8)
      ctx.fillStyle = mixColor(base, accent, mix)
      ctx.fillRect(0, y, size, 1)
    }
  } else if (variant === 'mars') {
    // Ochre / rust with darker albedo patches
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, '#a85a32')
    g.addColorStop(0.35, '#c46a3a')
    g.addColorStop(0.65, '#b85a30')
    g.addColorStop(1, '#8a3d22')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#6e2e18' : '#d4844a'
      ctx.globalAlpha = 0.12 + (i % 5) * 0.04
      ctx.beginPath()
      ctx.ellipse((i * 59) % size, (i * 83) % size, 12 + (i % 22), 7 + (i % 14), i, 0, Math.PI * 2)
      ctx.fill()
    }
    // Polar ice hint
    ctx.globalAlpha = 0.55
    const polar = ctx.createLinearGradient(0, 0, 0, size)
    polar.addColorStop(0, 'rgba(230,220,210,0.7)')
    polar.addColorStop(0.08, 'rgba(230,220,210,0)')
    polar.addColorStop(0.92, 'rgba(230,220,210,0)')
    polar.addColorStop(1, 'rgba(230,220,210,0.65)')
    ctx.fillStyle = polar
    ctx.fillRect(0, 0, size, size)
    ctx.globalAlpha = 1
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
  g.addColorStop(0, '#e2e8ef')
  g.addColorStop(0.35, '#c5ced8')
  g.addColorStop(0.7, '#b0bac4')
  g.addColorStop(1, '#d0d8e0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 220; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.02 + (i % 3) * 0.012})`
    ctx.beginPath()
    ctx.moveTo(0, (i * 17) % size)
    ctx.lineTo(size, (i * 17 + 40) % size)
    ctx.stroke()
  }
  // Circ weld rings cue
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = 'rgba(80,90,100,0.08)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, (i / 8) * size)
    ctx.lineTo(size, (i / 8) * size)
    ctx.stroke()
  }
  return toTexture(c, 2)
}
