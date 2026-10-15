import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  LEO_ALTITUDE_KM,
  LEO_RADIUS_KM,
  LEO_SPEED_KM_S,
  MOON_DISTANCE_KM,
  MOON_RADIUS_KM,
  MU_EARTH_KM3_S2,
} from '../data/astroConstants'
import { easeInOutCubic, clamp01 } from './ease'

export type PathKind = 'powered' | 'coast'

export type CraftKmSample = {
  position: THREE.Vector3
  tangent: THREE.Vector3
  altitudeKm: number
  segment: string
  kind: PathKind
  radiusKm: number
  speedKmS: number
  periapsisKm: number | null
  apoapsisKm: number | null
  noteEn: string
  noteZh: string
  /** Approximate mission time from T0 for HUD (teaching hours/days) */
  timeLabelEn: string
  timeLabelZh: string
}

const R = EARTH_RADIUS_KM
const LEO_R = LEO_RADIUS_KM
const MOON_D = MOON_DISTANCE_KM

/** Transfer ellipse: periapsis = LEO, apoapsis ≈ mean lunar distance. Earth at focus. */
export const MOON_TRANSFER = (() => {
  const rp = LEO_R
  const ra = MOON_D
  const a = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)
  return { rp, ra, a, e }
})()

function visViva(rKm: number, aKm: number): number {
  return Math.sqrt(MU_EARTH_KM3_S2 * (2 / rKm - 1 / aKm))
}

/**
 * Polar position on the teaching transfer ellipse.
 * Periapsis at ν=0 along −x (apoapsis ν=π toward Moon at +x).
 * Plane = xy. Earth at origin = focus. No foreshortening.
 */
export function transferEllipsePoint(nu: number): THREE.Vector3 {
  const { a, e } = MOON_TRANSFER
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
  return new THREE.Vector3(-r * Math.cos(nu), r * Math.sin(nu), 0)
}

function transferEllipseTangent(nu: number): THREE.Vector3 {
  const d = 0.008
  const p0 = transferEllipsePoint(nu)
  const p1 = transferEllipsePoint(Math.min(Math.PI, nu + d))
  return p1.sub(p0).normalize()
}

function leoPoint(theta: number): THREE.Vector3 {
  return new THREE.Vector3(Math.cos(theta) * LEO_R, Math.sin(theta) * LEO_R, 0)
}

function leoTangent(theta: number): THREE.Vector3 {
  return new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0).normalize()
}

/**
 * True-km Moon craft pose (1 unit = 1 km). Idealized patched-conic teaching model.
 *
 * Scrubber (aligned with educational phases):
 *  0–0.08  pad
 *  0.08–0.20 gravity-turn ascent → LEO
 *  0.20–0.32 LEO parking to TLI point
 *  0.32–0.36 prograde TLI burn
 *  0.36–0.62 coast ellipse ν: ~0→π (whole outbound transit)
 *  0.62–0.72 lunar approach / vicinity
 *  0.72–0.86 return coast (inbound arc)
 *  0.86–1    entry corridor
 */
export function craftKmAt(progress: number): CraftKmSample {
  const p = clamp01(progress)
  const { rp, ra, a } = MOON_TRANSFER
  // Ideal half-period of transfer ≈ π√(a³/μ) — order ~3–5 days teaching
  const transferDays = (Math.PI * Math.sqrt((a * a * a) / MU_EARTH_KM3_S2)) / 86400

  if (p < 0.08) {
    const theta = Math.PI - 0.55
    const n = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).normalize()
    const alt = 0.08
    return {
      position: n.multiplyScalar(R + alt),
      tangent: n.clone(),
      altitudeKm: alt,
      segment: 'pad',
      kind: 'powered',
      radiusKm: R + alt,
      speedKmS: 0,
      periapsisKm: null,
      apoapsisKm: null,
      noteEn: 'Pad (teaching site). Idealized profile — not a certified launch azimuth.',
      noteZh: '發射台（教學位置）。理想化剖面——非認證發射方位。',
      timeLabelEn: 'T−0',
      timeLabelZh: 'T−0',
    }
  }

  if (p < 0.2) {
    const u = easeInOutCubic((p - 0.08) / 0.12)
    const theta = THREE.MathUtils.lerp(Math.PI - 0.55, Math.PI - 0.15, u)
    const alt = THREE.MathUtils.lerp(0.08, LEO_ALTITUDE_KM, u)
    const r = R + alt
    const radial = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0)
    const position = radial.clone().multiplyScalar(r)
    const tangent = radial.clone().lerp(leoTangent(theta), 0.15 + 0.85 * u).normalize()
    const minutes = Math.round(u * 9)
    return {
      position,
      tangent,
      altitudeKm: alt,
      segment: 'ascent / gravity turn',
      kind: 'powered',
      radiusKm: r,
      speedKmS: THREE.MathUtils.lerp(0.05, LEO_SPEED_KM_S * 0.95, u),
      periapsisKm: null,
      apoapsisKm: null,
      noteEn: `Gravity turn into circular LEO (~${LEO_ALTITUDE_KM} km teaching altitude).`,
      noteZh: `重力轉向進入近地圓軌（教學高度約 ${LEO_ALTITUDE_KM} km）。`,
      timeLabelEn: `T+~${minutes} min`,
      timeLabelZh: `T+約 ${minutes} 分`,
    }
  }

  if (p < 0.32) {
    const u = (p - 0.2) / 0.12
    const theta = THREE.MathUtils.lerp(Math.PI - 0.15, Math.PI, u)
    const hours = (u * 1.5).toFixed(1)
    return {
      position: leoPoint(theta),
      tangent: leoTangent(theta),
      altitudeKm: LEO_ALTITUDE_KM,
      segment: 'LEO parking',
      kind: 'coast',
      radiusKm: LEO_R,
      speedKmS: LEO_SPEED_KM_S,
      periapsisKm: LEO_R,
      apoapsisKm: LEO_R,
      noteEn: `Circular LEO (~${LEO_ALTITUDE_KM} km). Coast to TLI point at periapsis (−x).`,
      noteZh: `近地圓軌（約 ${LEO_ALTITUDE_KM} km）。滑行至近地點 TLI（−x）。`,
      timeLabelEn: `LEO +~${hours} h`,
      timeLabelZh: `近地軌道 +約 ${hours} 小時`,
    }
  }

  if (p < 0.36) {
    const u = (p - 0.32) / 0.04
    const nu = u * 0.06
    const position = transferEllipsePoint(nu)
    const r = position.length()
    return {
      position,
      tangent: transferEllipseTangent(nu),
      altitudeKm: r - R,
      segment: 'TLI burn',
      kind: 'powered',
      radiusKm: r,
      speedKmS: visViva(r, a),
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn:
        'Prograde TLI at LEO periapsis — raises apoapsis to ~mean lunar distance (patched-conic teaching).',
      noteZh: '近地點沿切線 TLI——遠地點至約地月平均距離（拼貼圓錐教學）。',
      timeLabelEn: 'TLI',
      timeLabelZh: 'TLI',
    }
  }

  if (p < 0.62) {
    const u = easeInOutCubic((p - 0.36) / 0.26)
    const nu = THREE.MathUtils.lerp(0.06, Math.PI, u)
    const position = transferEllipsePoint(nu)
    const r = position.length()
    if (u > 0.92) {
      const w = (u - 0.92) / 0.08
      position.lerp(new THREE.Vector3(MOON_D - MOON_RADIUS_KM * 2.2, MOON_RADIUS_KM * 0.15, 0), w)
    }
    const days = (u * transferDays).toFixed(1)
    return {
      position,
      tangent: transferEllipseTangent(nu),
      altitudeKm: position.length() - R,
      segment: u > 0.9 ? 'lunar approach' : 'trans-lunar coast',
      kind: 'coast',
      radiusKm: position.length(),
      speedKmS: visViva(Math.max(r, rp), a),
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: `Transfer ellipse coast (Earth at focus; peri≈LEO, apo≈${MOON_D.toLocaleString()} km). Ideal ~${transferDays.toFixed(1)} d half-period.`,
      noteZh: `轉移橢圓巡航（地球在焦點；近≈LEO，遠≈${MOON_D.toLocaleString()} km）。理想半週期約 ${transferDays.toFixed(1)} 日。`,
      timeLabelEn: `Coast ~${days} / ${transferDays.toFixed(1)} d`,
      timeLabelZh: `巡航約 ${days} / ${transferDays.toFixed(1)} 日`,
    }
  }

  if (p < 0.72) {
    const u = (p - 0.62) / 0.1
    const ang = u * Math.PI * 0.7
    const orbitR = MOON_RADIUS_KM + 100
    return {
      position: new THREE.Vector3(MOON_D - Math.cos(ang) * orbitR, Math.sin(ang) * orbitR, 0),
      tangent: new THREE.Vector3(Math.sin(ang), Math.cos(ang), 0).normalize(),
      altitudeKm: 100,
      segment: 'lunar orbit / vicinity',
      kind: u < 0.25 ? 'powered' : 'coast',
      radiusKm: MOON_D,
      speedKmS: 1.6,
      periapsisKm: null,
      apoapsisKm: null,
      noteEn: 'Lunar vicinity / ~100 km lunar orbit class (schematic LOI — not a flown profile).',
      noteZh: '月球附近／約 100 km 月軌量級（示意 LOI——非真實飛行剖面）。',
      timeLabelEn: `~${transferDays.toFixed(1)} d (lunar)`,
      timeLabelZh: `約 ${transferDays.toFixed(1)} 日（月球）`,
    }
  }

  if (p < 0.86) {
    const u = easeInOutCubic((p - 0.72) / 0.14)
    const nu = Math.PI * (1 - u)
    const base = transferEllipsePoint(nu)
    const position = new THREE.Vector3(base.x, -base.y, 0)
    const r = position.length()
    const tangent = transferEllipseTangent(nu)
    tangent.y *= -1
    const days = ((1 - u) * transferDays).toFixed(1)
    return {
      position,
      tangent: tangent.normalize(),
      altitudeKm: r - R,
      segment: 'Earth-return coast',
      kind: 'coast',
      radiusKm: r,
      speedKmS: visViva(r, a),
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: 'Return on the teaching ellipse (distinct inbound arc, southern branch).',
      noteZh: '教學橢圓返回（獨立入境弧，南支）。',
      timeLabelEn: `Return coast ~${days} d`,
      timeLabelZh: `返回巡航約 ${days} 日`,
    }
  }

  const u = easeInOutCubic((p - 0.86) / 0.14)
  const alt = THREE.MathUtils.lerp(120, 0.05, u)
  const theta = Math.PI + 0.2 + u * 0.5
  return {
    position: new THREE.Vector3(Math.cos(theta) * (R + alt), Math.sin(theta) * (R + alt), 0),
    tangent: new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).negate().normalize(),
    altitudeKm: alt,
    segment: 'entry corridor',
    kind: 'powered',
    radiusKm: R + alt,
    speedKmS: THREE.MathUtils.lerp(11, 0.2, u),
    periapsisKm: null,
    apoapsisKm: null,
    noteEn: 'Atmospheric entry corridor (~11 km/s class lunar return order — not certified).',
    noteZh: '大氣再入走廊（月返約 11 km/s 量級——非認證）。',
    timeLabelEn: 'Entry',
    timeLabelZh: '再入',
  }
}

export function transferPathKm(segments = 180): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) pts.push(transferEllipsePoint((i / segments) * Math.PI))
  return pts
}

export function returnPathKm(segments = 120): THREE.Vector3[] {
  return transferPathKm(segments)
    .map((p) => new THREE.Vector3(p.x, -p.y, 0))
    .reverse()
}

export function leoPathKm(segments = 96): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) pts.push(leoPoint((i / segments) * Math.PI * 2))
  return pts
}

export function missionPathKm(samples = 320): { points: THREE.Vector3[]; kinds: PathKind[] } {
  const points: THREE.Vector3[] = []
  const kinds: PathKind[] = []
  for (let i = 0; i <= samples; i++) {
    const s = craftKmAt(i / samples)
    points.push(s.position.clone())
    kinds.push(s.kind)
  }
  return { points, kinds }
}

export function splitPathByKind(
  points: THREE.Vector3[],
  kinds: PathKind[],
): { powered: THREE.Vector3[][]; coast: THREE.Vector3[][] } {
  const powered: THREE.Vector3[][] = []
  const coast: THREE.Vector3[][] = []
  let cur: THREE.Vector3[] = []
  let curKind: PathKind | null = null
  for (let i = 0; i < points.length; i++) {
    const k = kinds[i]
    if (curKind == null) {
      curKind = k
      cur = [points[i]]
      continue
    }
    if (k !== curKind) {
      if (curKind === 'powered') powered.push(cur)
      else coast.push(cur)
      cur = [points[i - 1], points[i]]
      curKind = k
    } else {
      cur.push(points[i])
    }
  }
  if (curKind === 'powered') powered.push(cur)
  else if (curKind === 'coast') coast.push(cur)
  return { powered, coast }
}
