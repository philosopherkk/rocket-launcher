import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  LEO_ALTITUDE_KM,
  LEO_RADIUS_KM,
  MOON_DISTANCE_KM,
  MOON_RADIUS_KM,
} from '../data/astroConstants'
import { easeInOutCubic, clamp01 } from './ease'

export type CraftKmSample = {
  position: THREE.Vector3
  tangent: THREE.Vector3
  altitudeKm: number
}

const R = EARTH_RADIUS_KM
const LEO_R = LEO_RADIUS_KM
const MOON_D = MOON_DISTANCE_KM

/** Pad latitude bias (teaching — not a certified site). */
function padNormal(): THREE.Vector3 {
  const lat = 0.45
  const lon = 0.35
  return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat)).normalize()
}

/**
 * True-kilometre craft pose for Moon missions.
 * Scene units = km. Stack is ~0.124 km — only resolved when the camera is close.
 */
export function craftKmAt(progress: number): CraftKmSample {
  const p = clamp01(progress)
  const n0 = padNormal()
  const east = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), n0).normalize()

  if (p < 0.08) {
    const alt = 0.08 // ~80 m above surface (pad)
    const position = n0.clone().multiplyScalar(R + alt)
    return { position, tangent: n0.clone(), altitudeKm: alt }
  }

  if (p < 0.2) {
    const u = easeInOutCubic((p - 0.08) / 0.12)
    const alt = THREE.MathUtils.lerp(0.08, LEO_ALTITUDE_KM * 0.9, u)
    const downrange = u * 400 // km downrange
    const position = n0
      .clone()
      .multiplyScalar(R + alt)
      .add(east.clone().multiplyScalar(downrange))
    const tangent = n0.clone().lerp(east, 0.35).normalize()
    return { position, tangent, altitudeKm: alt }
  }

  if (p < 0.32) {
    const u = (p - 0.2) / 0.12
    const ang = u * Math.PI * 1.4
    const position = new THREE.Vector3(Math.cos(ang) * LEO_R, Math.sin(ang) * LEO_R * 0.85, Math.sin(ang) * LEO_R * 0.15)
    const tangent = new THREE.Vector3(-Math.sin(ang), Math.cos(ang) * 0.85, Math.cos(ang) * 0.15).normalize()
    return { position, tangent, altitudeKm: LEO_ALTITUDE_KM }
  }

  // Transfer ellipse in km: perigee LEO, apogee Moon distance
  const rp = LEO_R
  const ra = MOON_D
  const a = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)

  if (p < 0.62) {
    const u = easeInOutCubic((p - 0.32) / 0.3)
    const nu = u * Math.PI
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
    let position = new THREE.Vector3(Math.cos(nu) * r, Math.sin(nu) * r * 0.55, Math.sin(nu) * r * 0.08)
    if (u > 0.85) {
      const w = (u - 0.85) / 0.15
      const nearMoon = new THREE.Vector3(MOON_D - MOON_RADIUS_KM * 2.5, MOON_RADIUS_KM * 0.3, MOON_RADIUS_KM * 0.2)
      position.lerp(nearMoon, w)
    }
    const nextNu = Math.min(Math.PI, nu + 0.02)
    const r2 = (a * (1 - e * e)) / (1 + e * Math.cos(nextNu))
    const next = new THREE.Vector3(Math.cos(nextNu) * r2, Math.sin(nextNu) * r2 * 0.55, 0)
    const tangent = next.sub(position).normalize()
    return { position, tangent, altitudeKm: r - R }
  }

  if (p < 0.72) {
    const position = new THREE.Vector3(MOON_D - MOON_RADIUS_KM * 1.15, MOON_RADIUS_KM * 0.2, 0)
    return { position, tangent: new THREE.Vector3(0, 1, 0), altitudeKm: 0 }
  }

  if (p < 0.86) {
    const u = easeInOutCubic((p - 0.72) / 0.14)
    const nu = Math.PI * (1 - u)
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
    const position = new THREE.Vector3(Math.cos(nu) * r, -Math.sin(nu) * r * 0.55, r * 0.05)
    const tangent = new THREE.Vector3(Math.sin(nu), -Math.cos(nu), 0).normalize()
    return { position, tangent, altitudeKm: r - R }
  }

  // Entry corridor
  const u = easeInOutCubic((p - 0.86) / 0.14)
  const alt = THREE.MathUtils.lerp(120, 0.05, u)
  const ang = -0.3 - u * 0.4
  const position = new THREE.Vector3(Math.cos(ang) * (R + alt), Math.sin(ang) * (R + alt), alt * 0.1)
  const tangent = position.clone().normalize().negate()
  return { position, tangent, altitudeKm: alt }
}

export function transferPathKm(segments = 120): THREE.Vector3[] {
  const rp = LEO_R
  const ra = MOON_D
  const a = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const nu = (i / segments) * Math.PI
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
    pts.push(new THREE.Vector3(Math.cos(nu) * r, Math.sin(nu) * r * 0.55, Math.sin(nu) * r * 0.06))
  }
  return pts
}

export function leoPathKm(segments = 96): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * LEO_R, Math.sin(a) * LEO_R * 0.85, Math.sin(a) * LEO_R * 0.15))
  }
  return pts
}
