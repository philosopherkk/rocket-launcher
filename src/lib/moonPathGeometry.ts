/**
 * High-accuracy Moon transfer geometry for three.js / R3F (1 unit = 1 km).
 *
 * Patched-conic teaching model (idealized — not a flown Starship / NRHO profile):
 * - Earth-centered Kepler ellipse: periapsis = LEO, apoapsis = Moon − LLO
 *   so apoapsis meets the Earthward LLO point continuously.
 * - Speeds from vis-viva; coast anomaly from Kepler’s equation (mean → true).
 * - LOI Δv from coplanar hyperbolic approach (v∞ ≈ |v_Moon − v_apo|) into circular LLO.
 *
 * Sources class: NASA/IAU μ⊕ μ☾ & mean distances; Apollo/textbook TLI·LOI orders.
 */

import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  LEO_RADIUS_KM,
  LUNAR_ORBIT_RADIUS_KM,
  MOON_DISTANCE_KM,
  MU_EARTH_KM3_S2,
  MU_MOON_KM3_S2,
} from '../data/astroConstants'
import { nuFromMeanAnomalyCoast } from './kepler'

const MOON = new THREE.Vector3(MOON_DISTANCE_KM, 0, 0)

/** Transfer: peri = LEO, apo = Earthward LLO (continuous LOI handoff). */
export const MOON_TRANSFER_ACCURATE = (() => {
  const rp = LEO_RADIUS_KM
  const ra = MOON_DISTANCE_KM - LUNAR_ORBIT_RADIUS_KM
  const a = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)
  const p = a * (1 - e * e)
  const vPeri = Math.sqrt(MU_EARTH_KM3_S2 * (2 / rp - 1 / a))
  const vApo = Math.sqrt(MU_EARTH_KM3_S2 * (2 / ra - 1 / a))
  const vLeo = Math.sqrt(MU_EARTH_KM3_S2 / rp)
  const tliDv = vPeri - vLeo
  const vMoon = Math.sqrt(MU_EARTH_KM3_S2 / MOON_DISTANCE_KM)
  // Coplanar: craft slower at apo than Moon → Moon approaches from behind
  const vInf = Math.abs(vMoon - vApo)
  const vLlo = Math.sqrt(MU_MOON_KM3_S2 / LUNAR_ORBIT_RADIUS_KM)
  const vHypPeri = Math.sqrt(vInf * vInf + (2 * MU_MOON_KM3_S2) / LUNAR_ORBIT_RADIUS_KM)
  const loiDv = vHypPeri - vLlo
  const halfPeriodDays = (Math.PI * Math.sqrt((a * a * a) / MU_EARTH_KM3_S2)) / 86400
  return {
    rp,
    ra,
    a,
    e,
    p,
    vPeri,
    vApo,
    vLeo,
    tliDv,
    vMoon,
    vInf,
    vLlo,
    vHypPeri,
    loiDv,
    halfPeriodDays,
  }
})()

export type OrbitStateKm = {
  position: THREE.Vector3
  /** Unit tangent along increasing true anomaly (prograde). */
  tangent: THREE.Vector3
  /** Geocentric speed (km/s) from vis-viva. */
  speedKmS: number
  radiusKm: number
  nu: number
}

/** Polar state on Earth-centered transfer ellipse (focus at origin). */
export function transferStateAtNu(nu: number): OrbitStateKm {
  const { a, e, p } = MOON_TRANSFER_ACCURATE
  const c = Math.cos(nu)
  const s = Math.sin(nu)
  const r = p / (1 + e * c)
  // Periapsis along −x → apoapsis toward Moon (+x)
  const position = new THREE.Vector3(-r * c, r * s, 0)
  // Analytic d𝐫/dν (normalized) — continuous, no finite-difference noise
  // position = (−r cos ν, r sin ν); dr/dν = r e sin ν / (1 + e cos ν)
  const dr = (r * e * s) / (1 + e * c)
  const tangent = new THREE.Vector3(-dr * c + r * s, dr * s + r * c, 0).normalize()
  const speedKmS = Math.sqrt(MU_EARTH_KM3_S2 * (2 / r - 1 / a))
  return { position, tangent, speedKmS, radiusKm: r, nu }
}

export function leoStateAtTheta(theta: number): OrbitStateKm {
  const r = LEO_RADIUS_KM
  const position = new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0)
  const tangent = new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0)
  return {
    position,
    tangent,
    speedKmS: MOON_TRANSFER_ACCURATE.vLeo,
    radiusKm: r,
    nu: theta,
  }
}

/** θ=0 → Earthward (−x from Moon) = transfer apoapsis handoff. */
export function lunarOrbitStateAtTheta(theta: number): OrbitStateKm {
  const r = LUNAR_ORBIT_RADIUS_KM
  const position = new THREE.Vector3(
    MOON_DISTANCE_KM - Math.cos(theta) * r,
    Math.sin(theta) * r,
    0,
  )
  // Prograde about Moon (increasing θ): toward +y at θ=0
  const tangent = new THREE.Vector3(Math.sin(theta), Math.cos(theta), 0)
  return {
    position,
    tangent,
    speedKmS: MOON_TRANSFER_ACCURATE.vLlo,
    radiusKm: r,
    nu: theta,
  }
}

/**
 * LOI: lunar-relative circularization. Progress u∈[0,1] blends hyperbolic approach
 * speed → circular LLO while position rides the LLO circle (θ: 0 → small arc).
 * Position is continuous with transfer apoapsis at θ=0 (= Moon−LLO on +x).
 */
export function loiPathStateAt(u: number): OrbitStateKm {
  const t = Math.min(1, Math.max(0, u))
  const theta = t * 0.35
  const orb = lunarOrbitStateAtTheta(theta)
  const { vHypPeri, vLlo } = MOON_TRANSFER_ACCURATE
  return {
    position: orb.position.clone(),
    tangent: orb.tangent.clone(),
    speedKmS: THREE.MathUtils.lerp(vHypPeri, vLlo, t),
    radiusKm: LUNAR_ORBIT_RADIUS_KM,
    nu: theta,
  }
}

/** Kepler coast sample: fraction of mean anomaly from ν0→ν1. */
export function coastStateAt(frac: number, nu0 = 0.02, nu1 = Math.PI): OrbitStateKm {
  const { e } = MOON_TRANSFER_ACCURATE
  const nu = nuFromMeanAnomalyCoast(frac, nu0, nu1, e)
  return transferStateAtNu(nu)
}

/** Dense three.js-ready point list for the outbound Kepler guide (peri→apo). */
export function buildTransferCurvePoints(segments = 256): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const nu = (i / segments) * Math.PI
    pts.push(transferStateAtNu(nu).position.clone())
  }
  return pts
}

export function buildLeoCurvePoints(segments = 128): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const th = (i / segments) * Math.PI * 2
    pts.push(leoStateAtTheta(th).position.clone())
  }
  return pts
}

export function buildLloCurvePoints(segments = 128): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const th = (i / segments) * Math.PI * 2
    pts.push(lunarOrbitStateAtTheta(th).position.clone())
  }
  return pts
}

/** Catmull-Rom curve through Kepler samples — used by R3F Line / future Tube. */
export function buildTransferCurve3(segments = 256): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(buildTransferCurvePoints(segments), false, 'centripetal')
}

/**
 * Optional three.js ObjectLoader-friendly scene graph describing guide curves.
 * Accuracy lives in the sampled km points; JSON is a portable dump of those points.
 */
export function moonGuideCurvesToJSON(): object {
  const transfer = buildTransferCurvePoints(180).map((v) => [v.x, v.y, v.z])
  const leo = buildLeoCurvePoints(96).map((v) => [v.x, v.y, v.z])
  const llo = buildLloCurvePoints(96).map((v) => [v.x, v.y, v.z])
  const T = MOON_TRANSFER_ACCURATE
  return {
    metadata: {
      version: 4.5,
      type: 'Object',
      generator: 'moonPathGeometry',
      units: 'km',
      model: 'patched-conic-teaching',
    },
    geometries: [
      {
        uuid: 'transfer-ellipse',
        type: 'BufferGeometry',
        data: { attributes: { position: { itemSize: 3, type: 'Float32Array', array: transfer.flat() } } },
      },
      {
        uuid: 'leo-circle',
        type: 'BufferGeometry',
        data: { attributes: { position: { itemSize: 3, type: 'Float32Array', array: leo.flat() } } },
      },
      {
        uuid: 'llo-circle',
        type: 'BufferGeometry',
        data: { attributes: { position: { itemSize: 3, type: 'Float32Array', array: llo.flat() } } },
      },
    ],
    materials: [],
    object: {
      uuid: 'moon-guides',
      type: 'Group',
      name: 'MoonAccurateGuides',
      userData: {
        rp_km: T.rp,
        ra_km: T.ra,
        a_km: T.a,
        e: T.e,
        tliDv_kms: T.tliDv,
        loiDv_kms: T.loiDv,
        vInf_kms: T.vInf,
        halfPeriodDays: T.halfPeriodDays,
        earthRadius_km: EARTH_RADIUS_KM,
        moonDistance_km: MOON_DISTANCE_KM,
        lloRadius_km: LUNAR_ORBIT_RADIUS_KM,
        note: 'Idealized; apoapsis = Moon−LLO for continuous LOI. Not flown Starship/NRHO.',
      },
      children: [],
    },
  }
}

export { MOON }
