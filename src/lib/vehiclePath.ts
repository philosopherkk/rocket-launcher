import * as THREE from 'three'
import { easeInCubic, easeInOutCubic, easeOutQuad, smoothstep } from './ease'
import { phaseAtProgress } from '../data/phases'
import { getDestination, type DestinationId } from '../data/destinations'
import { VEHICLE_EARTH_RADIUS } from '../data/astroConstants'

export type VehiclePose = {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  shipOnly: boolean
  /** 0–1 throttle / plume intensity */
  plume: number
  /** Booster world pose when separating; null when stacked or gone */
  booster: { position: THREE.Vector3; quaternion: THREE.Quaternion; plume: number } | null
  phaseId: string
  /** True when craft is near Earth backdrop — use marker + inset, not giant silhouette */
  nearEarth: boolean
}

export function earthPos(): THREE.Vector3 {
  return new THREE.Vector3(-28, 0, 0)
}

export function earthRadius(): number {
  return VEHICLE_EARTH_RADIUS
}

/** Surface point slightly sunward / toward camera for pad framing */
function earthSurface(latBias = 0.55, lonBias = 0.35): THREE.Vector3 {
  const e = earthPos()
  const n = new THREE.Vector3(lonBias, latBias, 0.25).normalize()
  return e.clone().add(n.multiplyScalar(VEHICLE_EARTH_RADIUS * 1.002))
}

export function targetPos(destinationId: DestinationId): THREE.Vector3 {
  const d = getDestination(destinationId).visual.distanceScale
  return new THREE.Vector3(18 + d * 10, 4 + d * 1.2, -5 - d * 1.5)
}

/** Progress bands where Earth fills the frame — rocket must not be cartoon-huge */
export function isNearEarthProgress(progress: number): boolean {
  return progress < 0.34 || progress > 0.86
}

function orientAlong(dir: THREE.Vector3): THREE.Quaternion {
  const n = dir.clone().normalize()
  if (n.lengthSq() < 1e-8) return new THREE.Quaternion()
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)
}

function lerpV(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(a, b, t)
}

/**
 * Educational vehicle pose for scrubber progress 0–1.
 * Near Earth: positions track altitude class on the backdrop sphere (marker scale).
 * Far: readable ship framing without claiming Earth 1:1.
 */
export function vehiclePose(progress: number, destinationId: DestinationId): VehiclePose {
  const earth = earthPos()
  const R = VEHICLE_EARTH_RADIUS
  const target = targetPos(destinationId)
  const mid = lerpV(earth, target, 0.5).add(new THREE.Vector3(0, 12, 6))
  const landClearance = getDestination(destinationId).visual.radius + 1.15
  const pad = earthSurface(0.62, 0.42)
  const p = Math.min(1, Math.max(0, progress))
  const phase = phaseAtProgress(p, destinationId)
  const nearEarth = isNearEarthProgress(p)

  let position = pad.clone()
  let lookDir = new THREE.Vector3(0, 1, 0)
  let shipOnly = false
  let plume = 0
  let booster: VehiclePose['booster'] = null

  if (p < 0.08) {
    const t = p / 0.08
    position = pad.clone().add(new THREE.Vector3(0, Math.sin(t * Math.PI) * 0.01 * R, 0))
    lookDir.set(0.02, 1, 0.01)
    plume = 0
  } else if (p < 0.2) {
    // Ascent — climb a few percent of Earth radius (LEO ~300 km ≈ 0.047 R⊕)
    const u = easeInCubic((p - 0.08) / 0.12)
    const alt = THREE.MathUtils.lerp(0.002, 0.055, u) * R
    const n = pad.clone().sub(earth).normalize()
    const east = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), n).normalize()
    position = earth.clone().add(n.multiplyScalar(R + alt)).add(east.multiplyScalar(u * 0.08 * R))
    lookDir.copy(position).sub(earth).normalize().lerp(east, 0.25).normalize()
    plume = 0.55 + u * 0.45
  } else if (p < 0.32) {
    // Staging / parking — LEO altitude class on the sphere
    const raw = (p - 0.2) / 0.12
    const u = easeInOutCubic(raw)
    const alt = 0.055 * R
    const ang = u * Math.PI * 0.55
    const n0 = pad.clone().sub(earth).normalize()
    const axis = new THREE.Vector3(0, 1, 0)
    const n = n0.clone().applyAxisAngle(axis, ang)
    position = earth.clone().add(n.multiplyScalar(R + alt))
    lookDir.set(-Math.sin(ang + 0.4), 0.15, Math.cos(ang + 0.4)).normalize()
    shipOnly = raw > 0.22
    plume = shipOnly ? 0.85 : 0.95

    if (raw > 0.18) {
      const sep = easeOutQuad(Math.min(1, (raw - 0.18) / 0.55))
      const radial = position.clone().sub(earth).normalize()
      const bPos = position
        .clone()
        .add(radial.clone().multiplyScalar(-0.02 * R * (1 + sep)))
        .add(new THREE.Vector3(-sep * 0.5, -sep * 0.8, sep * 0.2))
      booster = {
        position: bPos,
        quaternion: orientAlong(radial.clone().negate()),
        plume: sep < 0.7 ? 0.7 * (1 - sep) : 0,
      }
    }
  } else if (p < 0.48) {
    const u = easeInOutCubic((p - 0.32) / 0.16)
    const start = earth.clone().add(new THREE.Vector3(R * 0.35, R * 0.55, R * 0.2))
    position = lerpV(start, mid, u)
    const next = lerpV(mid, target, Math.min(1, u + 0.05))
    lookDir.copy(next).sub(position).normalize()
    shipOnly = true
    if (u < 0.12) plume = 0.9 * (1 - u / 0.12)
    else if (u > 0.48 && u < 0.58) plume = 0.35 * smoothstep(1 - Math.abs(u - 0.53) / 0.05)
    else plume = 0.02
  } else if (p < 0.62) {
    const u = easeInOutCubic((p - 0.48) / 0.14)
    const approach = lerpV(mid, target, 0.72)
    const land = new THREE.Vector3(target.x - landClearance, target.y + 1.35, target.z)
    position = lerpV(approach, land, u)
    lookDir.copy(target).sub(position).normalize()
    const upMix = easeInOutCubic(Math.max(0, (u - 0.55) / 0.45))
    lookDir.lerp(new THREE.Vector3(0, 1, 0), upMix).normalize()
    shipOnly = true
    plume = u < 0.35 ? 0.05 : 0.4 + (u - 0.35) * 0.9
  } else if (p < 0.72) {
    position.set(target.x - landClearance + 0.2, target.y + 1.15, target.z)
    lookDir.set(0.03, 1, 0.02)
    shipOnly = true
    plume = 0
  } else if (p < 0.86) {
    const u = easeInOutCubic((p - 0.72) / 0.14)
    const from = new THREE.Vector3(target.x - landClearance + 0.2, target.y + 1.15, target.z)
    const to = lerpV(target, earth, 0.42).add(new THREE.Vector3(0, 10, 4))
    position = lerpV(from, to, u)
    lookDir.copy(to).sub(from).normalize()
    shipOnly = true
    if (u < 0.22) plume = 0.95 * (1 - u / 0.22)
    else if (u > 0.72 && u < 0.85) plume = 0.4
    else plume = 0.02
  } else {
    // Reentry — approach Earth surface at teaching altitude scale
    const u = easeInOutCubic((p - 0.86) / 0.14)
    const from = lerpV(target, earth, 0.42).add(new THREE.Vector3(0, 10, 4))
    const land = earthSurface(0.5, 0.5)
    const entryAlt = THREE.MathUtils.lerp(0.12, 0.002, u) * R
    const n = land.clone().sub(earth).normalize()
    const along = lerpV(from, land, u)
    position = earth.clone().add(n.multiplyScalar(R + entryAlt)).lerp(along, 0.35)
    lookDir.copy(land).sub(position).normalize()
    const upright = easeInOutCubic(Math.max(0, (u - 0.65) / 0.35))
    lookDir.lerp(new THREE.Vector3(0, 1, 0), upright).normalize()
    shipOnly = true
    plume = u > 0.72 ? 0.5 + (u - 0.72) * 1.5 : 0.05
  }

  return {
    position,
    quaternion: orientAlong(lookDir),
    shipOnly,
    plume: Math.min(1, Math.max(0, plume)),
    booster,
    phaseId: phase.id,
    nearEarth,
  }
}

export function cameraFraming(
  progress: number,
  pose: VehiclePose,
  destinationId: DestinationId = 'moon',
): { offset: THREE.Vector3; look: THREE.Vector3; fov: number } {
  const phase = phaseAtProgress(progress, destinationId)
  const look = pose.position.clone()
  const R = VEHICLE_EARTH_RADIUS
  let offset: THREE.Vector3
  let fov = 42

  if (pose.nearEarth) {
    // Pull back so Earth curvature dominates; craft is a pin, not the subject
    const focus = pose.position.clone().lerp(earthPos(), 0.55)
    switch (phase.id) {
      case 'prelaunch':
        offset = new THREE.Vector3(R * 1.1, R * 0.55, R * 1.6)
        look.copy(focus)
        fov = 36
        break
      case 'ascent':
        offset = new THREE.Vector3(R * 1.25, R * 0.65, R * 1.75)
        look.copy(focus)
        fov = 38
        break
      case 'staging':
        offset = new THREE.Vector3(R * 1.4, R * 0.7, R * 1.9)
        look.copy(earthPos())
        fov = 40
        break
      case 'reentry':
      default:
        offset = new THREE.Vector3(R * 1.2, R * 0.6, R * 1.7)
        look.copy(focus)
        fov = 38
    }
    return { offset, look, fov }
  }

  switch (phase.id) {
    case 'tli':
    case 'return':
      offset = new THREE.Vector3(11, 6.5, 13)
      fov = 48
      break
    case 'lunarApproach':
      offset = new THREE.Vector3(6.5, 3.2, 7.5)
      fov = 40
      break
    case 'surface':
      offset = new THREE.Vector3(5.5, 2.8, 6.5)
      look.add(new THREE.Vector3(0.4, 0.2, 0))
      fov = 38
      break
    default:
      offset = new THREE.Vector3(8, 4.5, 10)
  }

  return { offset, look, fov }
}
