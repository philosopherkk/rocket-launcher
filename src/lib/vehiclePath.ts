import * as THREE from 'three'
import { easeInCubic, easeInOutCubic, easeOutQuad, smoothstep } from './ease'
import { phaseAtProgress } from '../data/phases'
import { getDestination, type DestinationId } from '../data/destinations'

export type VehiclePose = {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  shipOnly: boolean
  /** 0–1 throttle / plume intensity */
  plume: number
  /** Booster world pose when separating; null when stacked or gone */
  booster: { position: THREE.Vector3; quaternion: THREE.Quaternion; plume: number } | null
  phaseId: string
}

export function earthPos(): THREE.Vector3 {
  return new THREE.Vector3(-18, 0, 0)
}

export function targetPos(destinationId: DestinationId): THREE.Vector3 {
  const d = getDestination(destinationId).visual.distanceScale
  return new THREE.Vector3(14 + d * 10, 3 + d * 1.2, -4 - d * 1.5)
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
 * Eased segments; not an operational trajectory.
 */
export function vehiclePose(progress: number, destinationId: DestinationId): VehiclePose {
  const earth = earthPos()
  const target = targetPos(destinationId)
  const mid = lerpV(earth, target, 0.5).add(new THREE.Vector3(0, 9, 5))
  const landClearance = getDestination(destinationId).visual.radius + 1.15
  const pad = new THREE.Vector3(earth.x + 2.15, earth.y + 2.55, earth.z + 0.05)
  const p = Math.min(1, Math.max(0, progress))
  const phase = phaseAtProgress(p)

  let position = pad.clone()
  let lookDir = new THREE.Vector3(0, 1, 0)
  let shipOnly = false
  let plume = 0
  let booster: VehiclePose['booster'] = null

  if (p < 0.08) {
    // Prelaunch: subtle sway
    const t = p / 0.08
    position = pad.clone().add(new THREE.Vector3(0, Math.sin(t * Math.PI) * 0.02, 0))
    lookDir.set(0.02, 1, 0.01)
    plume = 0
  } else if (p < 0.2) {
    // Ascent — heavy ease-in
    const u = easeInCubic((p - 0.08) / 0.12)
    const end = new THREE.Vector3(earth.x + 3.8, earth.y + 13.5, earth.z + 2.8)
    position = lerpV(pad, end, u)
    lookDir.copy(end).sub(pad).normalize().lerp(new THREE.Vector3(0.15, 1, 0.08), 0.35)
    plume = 0.55 + u * 0.45
  } else if (p < 0.32) {
    // Staging / orbital energy
    const raw = (p - 0.2) / 0.12
    const u = easeInOutCubic(raw)
    const start = new THREE.Vector3(earth.x + 3.8, earth.y + 13.5, earth.z + 2.8)
    const end = new THREE.Vector3(earth.x + 9, earth.y + 14.5, earth.z + 4)
    position = lerpV(start, end, u)
    lookDir.set(1, 0.15 + (1 - u) * 0.4, 0.12).normalize()
    shipOnly = raw > 0.22
    plume = shipOnly ? 0.85 : 0.95

    if (raw > 0.18) {
      const sep = easeOutQuad(Math.min(1, (raw - 0.18) / 0.55))
      const bPos = lerpV(
        position.clone().add(new THREE.Vector3(0, -3.2, 0)),
        position.clone().add(new THREE.Vector3(-2.5 - sep * 4, -6 - sep * 8, sep * 2)),
        sep,
      )
      const bDir = new THREE.Vector3(-0.2, -1, 0.05).normalize()
      booster = {
        position: bPos,
        quaternion: orientAlong(bDir),
        plume: sep < 0.7 ? 0.7 * (1 - sep) : 0,
      }
    }
  } else if (p < 0.48) {
    // Transfer coast
    const u = easeInOutCubic((p - 0.32) / 0.16)
    const start = new THREE.Vector3(earth.x + 9, earth.y + 14.5, earth.z + 4)
    position = lerpV(start, mid, u)
    const next = lerpV(mid, target, Math.min(1, u + 0.05))
    lookDir.copy(next).sub(position).normalize()
    shipOnly = true
    // Brief departure burn, quiet coast, tiny mid-course
    if (u < 0.12) plume = 0.9 * (1 - u / 0.12)
    else if (u > 0.48 && u < 0.58) plume = 0.35 * smoothstep(1 - Math.abs(u - 0.53) / 0.05)
    else plume = 0.02
  } else if (p < 0.62) {
    // Approach & landing
    const u = easeInOutCubic((p - 0.48) / 0.14)
    const approach = lerpV(mid, target, 0.72)
    const land = new THREE.Vector3(target.x - landClearance, target.y + 1.35, target.z)
    position = lerpV(approach, land, u)
    lookDir.copy(target).sub(position).normalize()
    // Tip upright near surface
    const upMix = easeInOutCubic(Math.max(0, (u - 0.55) / 0.45))
    lookDir.lerp(new THREE.Vector3(0, 1, 0), upMix).normalize()
    shipOnly = true
    plume = u < 0.35 ? 0.05 : 0.4 + (u - 0.35) * 0.9
  } else if (p < 0.72) {
    // Surface
    position.set(target.x - landClearance + 0.2, target.y + 1.15, target.z)
    lookDir.set(0.03, 1, 0.02)
    shipOnly = true
    plume = 0
  } else if (p < 0.86) {
    // Return transfer
    const u = easeInOutCubic((p - 0.72) / 0.14)
    const from = new THREE.Vector3(target.x - landClearance + 0.2, target.y + 1.15, target.z)
    const to = lerpV(target, earth, 0.42).add(new THREE.Vector3(0, 7, 3))
    position = lerpV(from, to, u)
    lookDir.copy(to).sub(from).normalize()
    shipOnly = true
    if (u < 0.22) plume = 0.95 * (1 - u / 0.22)
    else if (u > 0.72 && u < 0.85) plume = 0.4
    else plume = 0.02
  } else {
    // Earth reentry & landing
    const u = easeInOutCubic((p - 0.86) / 0.14)
    const from = lerpV(target, earth, 0.42).add(new THREE.Vector3(0, 7, 3))
    const land = new THREE.Vector3(earth.x + 2.5, earth.y + 2.35, earth.z + 0.4)
    position = lerpV(from, land, u)
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
  }
}

export function cameraFraming(
  progress: number,
  pose: VehiclePose,
): { offset: THREE.Vector3; look: THREE.Vector3; fov: number } {
  const phase = phaseAtProgress(progress)
  const look = pose.position.clone()
  let offset: THREE.Vector3
  let fov = 42

  switch (phase.id) {
    case 'prelaunch':
      offset = new THREE.Vector3(9.5, 4.2, 13.5)
      look.add(new THREE.Vector3(-1.4, -0.8, 0))
      fov = 40
      break
    case 'ascent':
      offset = new THREE.Vector3(7.5, 5.5, 11)
      fov = 44
      break
    case 'staging':
      offset = new THREE.Vector3(8, 3.5, 10)
      fov = 46
      break
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
    case 'reentry':
      offset = new THREE.Vector3(8, 4, 10)
      fov = 43
      break
    default:
      offset = new THREE.Vector3(8, 4.5, 10)
  }

  return { offset, look, fov }
}
