import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  KARMAN_LINE_KM,
  LEO_ALTITUDE_KM,
  LEO_RADIUS_KM,
  LEO_SPEED_KM_S,
  LOI_DV_KM_S,
  LUNAR_ORBIT_ALTITUDE_KM,
  LUNAR_ORBIT_RADIUS_KM,
  LUNAR_ORBIT_SPEED_KM_S,
  MOON_DISTANCE_KM,
  MU_EARTH_KM3_S2,
  TLI_DV_KM_S,
  TLI_SPEED_KM_S,
} from '../data/astroConstants'
import { easeInOutCubic, clamp01 } from './ease'
import { nuFromMeanAnomalyCoast } from './kepler'

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
const LLO_R = LUNAR_ORBIT_RADIUS_KM

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

/** Circular low lunar orbit about Moon center at (+MOON_D, 0). θ=0 → −x from Moon (Earthward). */
export function lunarOrbitPoint(theta: number): THREE.Vector3 {
  return new THREE.Vector3(MOON_D - Math.cos(theta) * LLO_R, Math.sin(theta) * LLO_R, 0)
}

function lunarOrbitTangent(theta: number): THREE.Vector3 {
  return new THREE.Vector3(Math.sin(theta), Math.cos(theta), 0).normalize()
}

/**
 * True-km Moon craft pose (1 unit = 1 km). Idealized patched-conic teaching model.
 *
 * Scrubber (aligned with educational phases):
 *  0–0.08  pad
 *  0.08–0.20 gravity-turn ascent (atm → Kármán → LEO)
 *  0.20–0.30 LEO parking
 *  0.30–0.34 prograde TLI burn
 *  0.34–0.56 coast ellipse ν: ~0→π (outbound transit)
 *  0.56–0.62 LOI braking burn into circular LLO
 *  0.62–0.76 lunar orbit (outbound end state — craft stays on LLO)
 *  0.76–0.88 return coast (inbound arc)
 *  0.88–1    entry corridor
 */
export function craftKmAt(progress: number): CraftKmSample {
  const p = clamp01(progress)
  const { rp, ra, a } = MOON_TRANSFER
  const transferDays = (Math.PI * Math.sqrt((a * a * a) / MU_EARTH_KM3_S2)) / 86400
  // Approach speed near apo (Earth-centered) before lunar SOI intuition
  const vApo = visViva(ra, a)
  // Teaching lunar-relative approach before LOI (Apollo-class hyperbolic order)
  const vApproachLunar = LUNAR_ORBIT_SPEED_KM_S + LOI_DV_KM_S

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
    const pastKarman = alt >= KARMAN_LINE_KM
    const segment = pastKarman
      ? 'ascent / LEO insertion'
      : alt < 12
        ? 'ascent / troposphere'
        : 'ascent / gravity turn'
    return {
      position,
      tangent,
      altitudeKm: alt,
      segment,
      kind: 'powered',
      radiusKm: r,
      speedKmS: THREE.MathUtils.lerp(0.05, LEO_SPEED_KM_S * 0.98, u),
      periapsisKm: null,
      apoapsisKm: null,
      noteEn: pastKarman
        ? `Above Kármán (~${KARMAN_LINE_KM} km) → circular LEO (~${LEO_ALTITUDE_KM} km teaching). Idealized — not a certified ascent.`
        : `Gravity turn through atmosphere toward Kármán (~${KARMAN_LINE_KM} km). Max-Q / heating peak mid-ascent (order-of-magnitude teaching).`,
      noteZh: pastKarman
        ? `已過卡門線（約 ${KARMAN_LINE_KM} km）→ 近地圓軌（教學高度約 ${LEO_ALTITUDE_KM} km）。理想化——非認證上升。`
        : `大氣中重力轉向朝卡門線（約 ${KARMAN_LINE_KM} km）。Max-Q／加熱峰值在中段上升（教學數量級）。`,
      timeLabelEn: `T+~${minutes} min`,
      timeLabelZh: `T+約 ${minutes} 分`,
    }
  }

  if (p < 0.3) {
    const u = (p - 0.2) / 0.1
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
      noteEn: `Circular LEO (~${LEO_ALTITUDE_KM} km, v≈${LEO_SPEED_KM_S.toFixed(2)} km/s). Coast to TLI point at periapsis (−x). Public lunar architectures refill here.`,
      noteZh: `近地圓軌（約 ${LEO_ALTITUDE_KM} km，v≈${LEO_SPEED_KM_S.toFixed(2)} km/s）。滑行至近地點 TLI（−x）。公開月球架構在此補加註。`,
      timeLabelEn: `LEO +~${hours} h`,
      timeLabelZh: `近地軌道 +約 ${hours} 小時`,
    }
  }

  if (p < 0.34) {
    const u = (p - 0.3) / 0.04
    const nu = u * 0.06
    const position = transferEllipsePoint(nu)
    const r = position.length()
    const speed = THREE.MathUtils.lerp(LEO_SPEED_KM_S, TLI_SPEED_KM_S, u)
    return {
      position,
      tangent: transferEllipseTangent(nu),
      altitudeKm: r - R,
      segment: 'TLI burn',
      kind: 'powered',
      radiusKm: r,
      speedKmS: speed,
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: `Prograde TLI Δv≈${TLI_DV_KM_S.toFixed(2)} km/s → v≈${TLI_SPEED_KM_S.toFixed(2)} km/s at peri (vis-viva; Apollo/textbook order ~3.1–3.2 km/s). Raises apo to ~${MOON_D.toLocaleString()} km. Idealized — not a Starship flight rule.`,
      noteZh: `沿切線 TLI Δv≈${TLI_DV_KM_S.toFixed(2)} km/s → 近地點 v≈${TLI_SPEED_KM_S.toFixed(2)} km/s（vis-viva；阿波羅／教科書約 3.1–3.2 km/s）。遠地點至約 ${MOON_D.toLocaleString()} km。理想化——非 Starship 飛行規則。`,
      timeLabelEn: 'TLI',
      timeLabelZh: 'TLI',
    }
  }

  if (p < 0.56) {
    const u = (p - 0.34) / 0.22
    const { e } = MOON_TRANSFER
    const nu = nuFromMeanAnomalyCoast(u, 0.06, Math.PI * 0.98, e)
    const position = transferEllipsePoint(nu)
    const r = position.length()
    const days = (u * transferDays).toFixed(1)
    const approaching = u > 0.88
    return {
      position,
      tangent: transferEllipseTangent(nu),
      altitudeKm: r - R,
      segment: approaching ? 'lunar approach' : 'trans-lunar coast',
      kind: 'coast',
      radiusKm: r,
      speedKmS: visViva(Math.max(r, rp), a),
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: approaching
        ? `Approaching Moon near apo (geocentric v≈${vApo.toFixed(2)} km/s). Next: LOI into ~${LUNAR_ORBIT_ALTITUDE_KM} km LLO. Ideal ~${transferDays.toFixed(1)} d half-period.`
        : `Transfer ellipse coast (Earth at focus; peri≈LEO, apo≈${MOON_D.toLocaleString()} km). Ideal ~${transferDays.toFixed(1)} d. Mid-course corrections not animated.`,
      noteZh: approaching
        ? `接近遠地點附近月球（地心 v≈${vApo.toFixed(2)} km/s）。下一步：LOI 進入約 ${LUNAR_ORBIT_ALTITUDE_KM} km 低月軌。理想半週期約 ${transferDays.toFixed(1)} 日。`
        : `轉移橢圓巡航（地球在焦點；近≈LEO，遠≈${MOON_D.toLocaleString()} km）。理想約 ${transferDays.toFixed(1)} 日。中途修正未動畫。`,
      timeLabelEn: `Coast ~${days} / ${transferDays.toFixed(1)} d`,
      timeLabelZh: `巡航約 ${days} / ${transferDays.toFixed(1)} 日`,
    }
  }

  // LOI burn — brake into circular LLO
  if (p < 0.62) {
    const u = easeInOutCubic((p - 0.56) / 0.06)
    const approach = transferEllipsePoint(Math.PI * 0.98)
    const captureTheta = 0.15
    const captured = lunarOrbitPoint(captureTheta)
    const position = approach.clone().lerp(captured, u)
    const tangent = transferEllipseTangent(Math.PI * 0.98)
      .clone()
      .lerp(lunarOrbitTangent(captureTheta), u)
      .normalize()
    const speed = THREE.MathUtils.lerp(vApproachLunar, LUNAR_ORBIT_SPEED_KM_S, u)
    return {
      position,
      tangent,
      altitudeKm: LUNAR_ORBIT_ALTITUDE_KM,
      segment: 'LOI burn',
      kind: 'powered',
      radiusKm: position.distanceTo(new THREE.Vector3(MOON_D, 0, 0)),
      speedKmS: speed,
      periapsisKm: LLO_R,
      apoapsisKm: LLO_R,
      noteEn: `LOI braking Δv≈${LOI_DV_KM_S.toFixed(1)} km/s class (Apollo-order teaching) into circular LLO ~${LUNAR_ORBIT_ALTITUDE_KM} km (v≈${LUNAR_ORBIT_SPEED_KM_S.toFixed(2)} km/s). Idealized patched-conic — not a flown Starship / NRHO profile.`,
      noteZh: `LOI 煞車 Δv≈${LOI_DV_KM_S.toFixed(1)} km/s 量級（阿波羅教學）進入約 ${LUNAR_ORBIT_ALTITUDE_KM} km 圓形低月軌（v≈${LUNAR_ORBIT_SPEED_KM_S.toFixed(2)} km/s）。理想拼接圓錐——非真實 Starship／NRHO 剖面。`,
      timeLabelEn: 'LOI',
      timeLabelZh: 'LOI',
    }
  }

  // Lunar orbit — outbound end state; several revolutions so insertion is watchable
  if (p < 0.76) {
    const u = (p - 0.62) / 0.14
    const theta = 0.15 + u * Math.PI * 4.5
    const position = lunarOrbitPoint(theta)
    const revs = (u * 2.25).toFixed(1)
    return {
      position,
      tangent: lunarOrbitTangent(theta),
      altitudeKm: LUNAR_ORBIT_ALTITUDE_KM,
      segment: 'lunar orbit (LLO)',
      kind: 'coast',
      radiusKm: LLO_R,
      speedKmS: LUNAR_ORBIT_SPEED_KM_S,
      periapsisKm: LLO_R,
      apoapsisKm: LLO_R,
      noteEn: `Circular lunar orbit ~${LUNAR_ORBIT_ALTITUDE_KM} km (peri=apo=${LLO_R.toFixed(0)} km from Moon center). v≈${LUNAR_ORBIT_SPEED_KM_S.toFixed(2)} km/s. Outbound teaching end-state after LOI (~${revs} rev). Public HLS often uses NRHO instead — labeled idealized.`,
      noteZh: `圓形月軌約 ${LUNAR_ORBIT_ALTITUDE_KM} km（近=遠=${LLO_R.toFixed(0)} km，自月心）。v≈${LUNAR_ORBIT_SPEED_KM_S.toFixed(2)} km/s。LOI 後單程教學終態（約 ${revs} 圈）。公開 HLS 常用 NRHO——已標示理想化。`,
      timeLabelEn: `LLO ~${transferDays.toFixed(1)} d +`,
      timeLabelZh: `低月軌 約 ${transferDays.toFixed(1)} 日+`,
    }
  }

  if (p < 0.88) {
    const u = easeInOutCubic((p - 0.76) / 0.12)
    const { e } = MOON_TRANSFER
    const nu = nuFromMeanAnomalyCoast(1 - u, 0.06, Math.PI, e)
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
      noteEn: 'Return on the teaching ellipse after LLO (distinct inbound arc, southern branch). Idealized TEI — not Orion/HLS CONOPS.',
      noteZh: '離開低月軌後沿教學橢圓返回（獨立入境弧，南支）。理想 TEI——非 Orion／HLS 作戰概念。',
      timeLabelEn: `Return coast ~${days} d`,
      timeLabelZh: `返回巡航約 ${days} 日`,
    }
  }

  const u = easeInOutCubic((p - 0.88) / 0.12)
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
    noteEn: 'Atmospheric entry corridor (~11 km/s class lunar return order — not certified). No invented Starship heat-rate tables.',
    noteZh: '大氣再入走廊（月返約 11 km/s 量級——非認證）。不虛構 Starship 熱流表。',
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

export function lunarOrbitPathKm(segments = 96): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) pts.push(lunarOrbitPoint((i / segments) * Math.PI * 2))
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
