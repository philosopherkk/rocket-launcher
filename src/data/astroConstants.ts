/**
 * Public mean values for educational scaling (IAU / NASA fact-sheet class).
 * See docs/data-sources.md.
 */

export const KM_PER_AU = 149_597_870.7
/** Mean Earth volumetric radius */
export const EARTH_RADIUS_KM = 6371
export const EARTH_RADIUS_AU = EARTH_RADIUS_KM / KM_PER_AU

export const MOON_RADIUS_KM = 1737.4
export const MOON_RADIUS_EARTH = MOON_RADIUS_KM / EARTH_RADIUS_KM
/** Mean Earth–Moon center distance */
export const MOON_DISTANCE_KM = 384_400
export const MOON_DISTANCE_EARTH_RADII = MOON_DISTANCE_KM / EARTH_RADIUS_KM

/** Typical LEO altitude class used for teaching (not a Starship flight rule) */
export const LEO_ALTITUDE_KM = 300
export const LEO_RADIUS_KM = EARTH_RADIUS_KM + LEO_ALTITUDE_KM

/** Circular LEO speed order-of-magnitude √(μ/r) with μ⊕≈3.986e5 km³/s² */
export const MU_EARTH_KM3_S2 = 398_600
export const LEO_SPEED_KM_S = Math.sqrt(MU_EARTH_KM3_S2 / LEO_RADIUS_KM)

export const MU_SUN_KM3_S2 = 132_712_440_018

export type BodyId = 'earth' | 'moon' | 'mars' | 'venus' | 'mercury' | 'jupiter' | 'sun'

export const BODY_RADIUS_KM: Record<BodyId, number> = {
  sun: 695_700,
  earth: EARTH_RADIUS_KM,
  moon: MOON_RADIUS_KM,
  mars: 3389.5,
  venus: 6051.8,
  mercury: 2439.7,
  jupiter: 69_911,
}

/** Mean heliocentric semi-major axes (AU) */
export const HELIO_A_AU: Record<'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter', number> = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
  jupiter: 5.203,
}

export const STACK_HEIGHT_M = 124
export const SHIP_HEIGHT_M = 52
export const BOOSTER_HEIGHT_M = 72
export const VEHICLE_DIAMETER_M = 9

export type ScaleMode = 'auto' | 'planet' | 'vehicle'

/**
 * In heliocentric planet mode, true planet radii are ~1e-5 AU — invisible.
 * Distances stay true AU; spheres are multiplied by this factor and labeled in the HUD.
 */
export const HELIO_BODY_EXAGGERATION = 1800

/** Phases that prefer vehicle-scale inset (pad / aero / surface detail). */
export function defaultScaleForProgress(progress: number): 'planet' | 'vehicle' {
  // Match phase bands in phases.ts
  if (progress < 0.32) return 'vehicle' // prelaunch → staging
  if (progress < 0.72) return 'planet' // transfer → surface (orbital view)
  if (progress < 0.86) return 'planet' // return coast
  return 'vehicle' // reentry & landing
}

export function resolveScaleMode(mode: ScaleMode, progress: number): 'planet' | 'vehicle' {
  if (mode === 'auto') return defaultScaleForProgress(progress)
  return mode
}
