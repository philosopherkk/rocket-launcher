/** Smoothstep and cubic easings for heavy, non-toy motion. */

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

export function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeOutQuad(t: number): number {
  const x = clamp01(t)
  return 1 - (1 - x) * (1 - x)
}

export function easeInQuad(t: number): number {
  const x = clamp01(t)
  return x * x
}

/** Heavier lift-off feel: slow start, then commit. */
export function easeInCubic(t: number): number {
  const x = clamp01(t)
  return x * x * x
}
