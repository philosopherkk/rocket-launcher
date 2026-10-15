/**
 * Idealized circular, coplanar Hohmann helpers for education.
 * Distances: approximate mean heliocentric semi-major axes (AU).
 * μ_sun from IAU / standard astrodynamics references (km³/s²).
 */

export const AU_KM = 149_597_870.7
/** Solar gravitational parameter (km³/s²) — standard value used in textbooks / JPL-style two-body calcs */
export const MU_SUN_KM3_S2 = 132_712_440_018

export type HohmannResult = {
  /** Semi-major axis of transfer ellipse (AU) */
  transferA_AU: number
  /** One-way coast time (days) — half the transfer period */
  oneWayDays: number
  /** Δv to leave circular heliocentric orbit at r1 onto transfer (km/s) */
  dvDepart_kms: number
  /** Heliocentric velocity match at arrival (≈ v∞ before capture/aerocapture) (km/s) */
  dvArrive_kms: number
  /** Sum of the two heliocentric burns (km/s) — does NOT include Earth escape / planetary capture from surface */
  heliocentricDv_kms: number
  /** Synodic period between two circular solar orbits (days) */
  synodicDays: number
  /** Target mean longitude lead/lag vs Earth at departure (degrees, teaching Hohmann window) */
  launchWindowPhaseDeg: number
}

export function orbitalPeriodDays(a_AU: number): number {
  // Kepler: T² ∝ a³; Earth year ≈ 365.25 d at 1 AU
  return 365.25 * Math.pow(a_AU, 1.5)
}

function circularVelocityKms(r_AU: number): number {
  const r = r_AU * AU_KM
  return Math.sqrt(MU_SUN_KM3_S2 / r)
}

/**
 * Earth (r1) ↔ target (r2) minimum-energy Hohmann, circular coplanar.
 * Synodic period uses mean motions of the two planets.
 */
export function hohmannEarthTo(targetAU: number): HohmannResult {
  const r1 = 1
  const r2 = targetAU
  const a = (r1 + r2) / 2
  const oneWayDays = orbitalPeriodDays(a) / 2

  const v1 = circularVelocityKms(r1)
  const v2 = circularVelocityKms(r2)
  const vPeri = Math.sqrt(MU_SUN_KM3_S2 * (2 / (r1 * AU_KM) - 1 / (a * AU_KM)))
  const vApo = Math.sqrt(MU_SUN_KM3_S2 * (2 / (r2 * AU_KM) - 1 / (a * AU_KM)))

  const dvDepart = Math.abs(vPeri - v1)
  const dvArrive = Math.abs(v2 - vApo)

  const n1 = (2 * Math.PI) / orbitalPeriodDays(r1)
  const n2 = (2 * Math.PI) / orbitalPeriodDays(r2)
  const synodicDays = (2 * Math.PI) / Math.abs(n1 - n2)

  const deltaTarget = n2 * oneWayDays
  const outer = r2 > r1
  const phaseRad = outer ? Math.PI - deltaTarget : deltaTarget - Math.PI
  const launchWindowPhaseDeg = (phaseRad * 180) / Math.PI

  return {
    transferA_AU: a,
    oneWayDays,
    dvDepart_kms: dvDepart,
    dvArrive_kms: dvArrive,
    heliocentricDv_kms: dvDepart + dvArrive,
    synodicDays,
    launchWindowPhaseDeg,
  }
}

/** LEO departure burn from circular orbit given heliocentric v∞ at Earth sphere (km/s). */
export function departureFromLeoDv(vInfKms: number, rKm = 6_571, muEarth = 398_600.4418): number {
  const vLeo = Math.sqrt(muEarth / rKm)
  const vEsc = Math.sqrt(vInfKms * vInfKms + 2 * muEarth / rKm)
  return vEsc - vLeo
}

export function formatDays(days: number, locale: 'en' | 'zh-Hant'): string {
  if (days < 40) {
    const d = Math.round(days)
    return locale === 'en' ? `~${d} days` : `約 ${d} 日`
  }
  if (days < 400) {
    const d = Math.round(days)
    const mo = (days / 30.44).toFixed(1)
    return locale === 'en' ? `~${d} days (~${mo} mo)` : `約 ${d} 日（約 ${mo} 個月）`
  }
  const y = (days / 365.25).toFixed(2)
  const d = Math.round(days)
  return locale === 'en' ? `~${d} days (~${y} yr)` : `約 ${d} 日（約 ${y} 年）`
}

export function formatKms(v: number): string {
  return `${v.toFixed(2)} km/s`
}
