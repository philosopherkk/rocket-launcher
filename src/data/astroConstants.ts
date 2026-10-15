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

/**
 * Approximate mean longitudes L (degrees) at epoch J2000.0.
 * Source: JPL SSD — Keplerian Elements for Approximate Positions of the Major Planets
 * (https://ssd.jpl.nasa.gov/planets/approx_pos.html), L at J2000.
 * Used as a fixed educational longitude snapshot on circular mean-a orbits —
 * not a live ephemeris. Prevents the collinear “scale ladder on +x” layout.
 */
export const HELIO_MEAN_LONG_DEG_J2000: Record<
  'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter',
  number
> = {
  mercury: 252.251,
  venus: 181.98,
  earth: 100.464,
  mars: 355.453,
  jupiter: 34.404,
}

/** Short citation shown in the HUD for helio longitude assumption */
export const HELIO_LONGITUDE_ASSUMPTION_EN =
  'Planet longitudes: J2000 mean L (JPL SSD approx. elements) on circular mean-a orbits; target advances along its orbit from Hohmann departure to arrival. Not a live ephemeris.'
export const HELIO_LONGITUDE_ASSUMPTION_ZH =
  '行星經度：J2000 平黃經 L（JPL SSD 近似根數）置於圓形平均半長軸軌道；目標星沿軌道從霍曼出發點移至到達點。非即時星曆。'

export const STACK_HEIGHT_M = 124
export const SHIP_HEIGHT_M = 52
export const BOOSTER_HEIGHT_M = 72
export const VEHICLE_DIAMETER_M = 9

/**
 * Vehicle-mode Earth sphere radius in scene units (limb / curvature backdrop).
 * Stack height at true teaching scale = this × (STACK_HEIGHT_M / (EARTH_RADIUS_KM×1000))
 * ≈ R × 1.95e-5 — invisible; near-Earth craft is a marker + inset (see VehicleScaleScene).
 */
export const VEHICLE_EARTH_RADIUS = 16

/** True stack / Earth-radius ratio (124 m / 6,371 km) for teaching disclosure */
export const STACK_OVER_EARTH_RADIUS = STACK_HEIGHT_M / (EARTH_RADIUS_KM * 1000)

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
