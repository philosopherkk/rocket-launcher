import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  KARMAN_LINE_KM,
  LEO_ALTITUDE_KM,
  LEO_RADIUS_KM,
  LUNAR_ORBIT_ALTITUDE_KM,
  LUNAR_ORBIT_RADIUS_KM,
} from '../data/astroConstants'
import { easeInOutCubic, clamp01 } from './ease'
import {
  buildLeoCurvePoints,
  buildLloCurvePoints,
  buildTransferCurvePoints,
  coastStateAt,
  leoStateAtTheta,
  loiPathStateAt,
  lunarOrbitStateAtTheta,
  MOON_TRANSFER_ACCURATE,
  transferStateAtNu,
} from './moonPathGeometry'
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
  timeLabelEn: string
  timeLabelZh: string
}

const R = EARTH_RADIUS_KM
const LLO_R = LUNAR_ORBIT_RADIUS_KM

/** @deprecated Prefer MOON_TRANSFER_ACCURATE — kept for transferGeometry imports. */
export const MOON_TRANSFER = {
  rp: MOON_TRANSFER_ACCURATE.rp,
  ra: MOON_TRANSFER_ACCURATE.ra,
  a: MOON_TRANSFER_ACCURATE.a,
  e: MOON_TRANSFER_ACCURATE.e,
}

export function transferEllipsePoint(nu: number): THREE.Vector3 {
  return transferStateAtNu(nu).position.clone()
}

export function lunarOrbitPoint(theta: number): THREE.Vector3 {
  return lunarOrbitStateAtTheta(theta).position.clone()
}

/**
 * True-km Moon craft pose (1 unit = 1 km). Accurate patched-conic teaching model
 * on three.js / R3F — Kepler coast, analytic tangents, computed TLI/LOI Δv.
 *
 * Scrubber:
 *  0–0.08  pad
 *  0.08–0.20 gravity-turn ascent (atm → Kármán → LEO)
 *  0.20–0.30 LEO parking
 *  0.30–0.34 prograde TLI burn
 *  0.34–0.56 Kepler coast (mean anomaly) ν: ~0→π
 *  0.56–0.62 LOI into circular LLO (continuous at apoapsis = Moon−LLO)
 *  0.62–0.76 lunar orbit (outbound end state)
 *  0.76–0.88 return coast
 *  0.88–1    entry corridor
 */
export function craftKmAt(progress: number): CraftKmSample {
  const p = clamp01(progress)
  const T = MOON_TRANSFER_ACCURATE
  const { rp, ra, tliDv, vPeri, vLeo, vLlo, loiDv, vHypPeri, vInf, halfPeriodDays, vApo } = T

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
    const leoT = leoStateAtTheta(theta).tangent
    const position = radial.clone().multiplyScalar(r)
    const tangent = radial.clone().lerp(leoT, 0.15 + 0.85 * u).normalize()
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
      speedKmS: THREE.MathUtils.lerp(0.05, vLeo * 0.98, u),
      periapsisKm: null,
      apoapsisKm: null,
      noteEn: pastKarman
        ? `Above Kármán (~${KARMAN_LINE_KM} km) → circular LEO (~${LEO_ALTITUDE_KM} km). v→${vLeo.toFixed(2)} km/s. Idealized ascent.`
        : `Gravity turn through atmosphere toward Kármán (~${KARMAN_LINE_KM} km). Max-Q / heating mid-ascent (order-of-magnitude).`,
      noteZh: pastKarman
        ? `已過卡門線（約 ${KARMAN_LINE_KM} km）→ 近地圓軌（約 ${LEO_ALTITUDE_KM} km）。v→${vLeo.toFixed(2)} km/s。理想化上升。`
        : `大氣中重力轉向朝卡門線（約 ${KARMAN_LINE_KM} km）。Max-Q／加熱在中段上升（教學數量級）。`,
      timeLabelEn: `T+~${minutes} min`,
      timeLabelZh: `T+約 ${minutes} 分`,
    }
  }

  if (p < 0.3) {
    const u = (p - 0.2) / 0.1
    const theta = THREE.MathUtils.lerp(Math.PI - 0.15, Math.PI, u)
    const s = leoStateAtTheta(theta)
    const hours = (u * 1.5).toFixed(1)
    return {
      position: s.position,
      tangent: s.tangent,
      altitudeKm: LEO_ALTITUDE_KM,
      segment: 'LEO parking',
      kind: 'coast',
      radiusKm: LEO_RADIUS_KM,
      speedKmS: vLeo,
      periapsisKm: LEO_RADIUS_KM,
      apoapsisKm: LEO_RADIUS_KM,
      noteEn: `Circular LEO (~${LEO_ALTITUDE_KM} km, v=√(μ⊕/r)≈${vLeo.toFixed(2)} km/s). Coast to TLI at periapsis (−x). Public lunar architectures refill here.`,
      noteZh: `近地圓軌（約 ${LEO_ALTITUDE_KM} km，v=√(μ⊕/r)≈${vLeo.toFixed(2)} km/s）。滑行至近地點 TLI（−x）。公開月球架構在此補加註。`,
      timeLabelEn: `LEO +~${hours} h`,
      timeLabelZh: `近地軌道 +約 ${hours} 小時`,
    }
  }

  if (p < 0.34) {
    const u = (p - 0.3) / 0.04
    const nu = u * 0.08
    const s = transferStateAtNu(nu)
    const speed = THREE.MathUtils.lerp(vLeo, vPeri, u)
    return {
      position: s.position,
      tangent: s.tangent,
      altitudeKm: s.radiusKm - R,
      segment: 'TLI burn',
      kind: 'powered',
      radiusKm: s.radiusKm,
      speedKmS: speed,
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: `Prograde TLI Δv=v_peri−v_LEO≈${tliDv.toFixed(2)} km/s → v≈${vPeri.toFixed(2)} km/s (vis-viva). Apoapsis=${ra.toLocaleString()} km (Moon−LLO) for continuous LOI. Idealized — not a Starship flight rule.`,
      noteZh: `沿切線 TLI Δv≈${tliDv.toFixed(2)} km/s → v≈${vPeri.toFixed(2)} km/s（vis-viva）。遠地點=${ra.toLocaleString()} km（月球−LLO）以連續 LOI。理想化——非 Starship 飛行規則。`,
      timeLabelEn: 'TLI',
      timeLabelZh: 'TLI',
    }
  }

  if (p < 0.56) {
    const u = (p - 0.34) / 0.22
    const s = coastStateAt(u, 0.08, Math.PI)
    const days = (u * halfPeriodDays).toFixed(1)
    const approaching = u > 0.88
    return {
      position: s.position,
      tangent: s.tangent,
      altitudeKm: s.radiusKm - R,
      segment: approaching ? 'lunar approach' : 'trans-lunar coast',
      kind: 'coast',
      radiusKm: s.radiusKm,
      speedKmS: s.speedKmS,
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: approaching
        ? `Near apo (geocentric v≈${vApo.toFixed(2)} km/s). v∞≈${vInf.toFixed(2)} km/s vs Moon. Next: LOI Δv≈${loiDv.toFixed(2)} km/s into ${LUNAR_ORBIT_ALTITUDE_KM} km LLO. Kepler half-period ≈${halfPeriodDays.toFixed(2)} d.`
        : `Kepler coast on ellipse (Earth at focus; peri=${rp.toFixed(0)} km, apo=${ra.toFixed(0)} km=Moon−LLO). Mean-anomaly timing. Ideal ~${halfPeriodDays.toFixed(2)} d.`,
      noteZh: approaching
        ? `近遠地點（地心 v≈${vApo.toFixed(2)} km/s）。相對月球 v∞≈${vInf.toFixed(2)} km/s。下一步：LOI Δv≈${loiDv.toFixed(2)} km/s 進入 ${LUNAR_ORBIT_ALTITUDE_KM} km LLO。Kepler 半週期 ≈${halfPeriodDays.toFixed(2)} 日。`
        : `Kepler 橢圓巡航（地球在焦點；近=${rp.toFixed(0)} km，遠=${ra.toFixed(0)} km=月球−LLO）。平近點角計時。理想約 ${halfPeriodDays.toFixed(2)} 日。`,
      timeLabelEn: `Coast ~${days} / ${halfPeriodDays.toFixed(1)} d`,
      timeLabelZh: `巡航約 ${days} / ${halfPeriodDays.toFixed(1)} 日`,
    }
  }

  // LOI — continuous handoff at apoapsis = lunarOrbitPoint(0)
  if (p < 0.62) {
    const u = easeInOutCubic((p - 0.56) / 0.06)
    const s = loiPathStateAt(u)
    return {
      position: s.position,
      tangent: s.tangent,
      altitudeKm: LUNAR_ORBIT_ALTITUDE_KM,
      segment: 'LOI burn',
      kind: 'powered',
      radiusKm: LLO_R,
      speedKmS: s.speedKmS,
      periapsisKm: LLO_R,
      apoapsisKm: LLO_R,
      noteEn: `LOI Δv=v_hyp−v_LLO≈${loiDv.toFixed(2)} km/s (v∞≈${vInf.toFixed(2)}, v_hyp≈${vHypPeri.toFixed(2)} → v_LLO≈${vLlo.toFixed(2)} km/s). Circular LLO ~${LUNAR_ORBIT_ALTITUDE_KM} km. Patched-conic — not flown Starship/NRHO.`,
      noteZh: `LOI Δv≈${loiDv.toFixed(2)} km/s（v∞≈${vInf.toFixed(2)}，v_hyp≈${vHypPeri.toFixed(2)} → v_LLO≈${vLlo.toFixed(2)} km/s）。圓形 LLO 約 ${LUNAR_ORBIT_ALTITUDE_KM} km。拼接圓錐——非真實 Starship／NRHO。`,
      timeLabelEn: 'LOI',
      timeLabelZh: 'LOI',
    }
  }

  if (p < 0.76) {
    const u = (p - 0.62) / 0.14
    const theta = 0.35 + u * Math.PI * 4.5
    const s = lunarOrbitStateAtTheta(theta)
    const revs = (u * 2.25).toFixed(1)
    return {
      position: s.position,
      tangent: s.tangent,
      altitudeKm: LUNAR_ORBIT_ALTITUDE_KM,
      segment: 'lunar orbit (LLO)',
      kind: 'coast',
      radiusKm: LLO_R,
      speedKmS: vLlo,
      periapsisKm: LLO_R,
      apoapsisKm: LLO_R,
      noteEn: `Circular LLO ~${LUNAR_ORBIT_ALTITUDE_KM} km (peri=apo=${LLO_R.toFixed(0)} km). v=√(μ☾/r)≈${vLlo.toFixed(2)} km/s. Outbound end-state after LOI (~${revs} rev). HLS often uses NRHO — labeled idealized.`,
      noteZh: `圓形 LLO 約 ${LUNAR_ORBIT_ALTITUDE_KM} km（近=遠=${LLO_R.toFixed(0)} km）。v=√(μ☾/r)≈${vLlo.toFixed(2)} km/s。LOI 後單程終態（約 ${revs} 圈）。HLS 常用 NRHO——已標示理想化。`,
      timeLabelEn: `LLO ~${halfPeriodDays.toFixed(1)} d +`,
      timeLabelZh: `低月軌 約 ${halfPeriodDays.toFixed(1)} 日+`,
    }
  }

  if (p < 0.88) {
    const u = easeInOutCubic((p - 0.76) / 0.12)
    const { e } = T
    const nu = nuFromMeanAnomalyCoast(1 - u, 0.08, Math.PI, e)
    const base = transferStateAtNu(nu)
    const position = new THREE.Vector3(base.position.x, -base.position.y, 0)
    const tangent = base.tangent.clone()
    tangent.y *= -1
    const days = ((1 - u) * halfPeriodDays).toFixed(1)
    return {
      position,
      tangent: tangent.normalize(),
      altitudeKm: base.radiusKm - R,
      segment: 'Earth-return coast',
      kind: 'coast',
      radiusKm: base.radiusKm,
      speedKmS: base.speedKmS,
      periapsisKm: rp,
      apoapsisKm: ra,
      noteEn: 'Return on the teaching ellipse after LLO (southern branch). Idealized TEI — not Orion/HLS CONOPS.',
      noteZh: '離開 LLO 後沿教學橢圓返回（南支）。理想 TEI——非 Orion／HLS 作戰概念。',
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
    noteEn: 'Atmospheric entry corridor (~11 km/s class lunar return — not certified). No invented Starship heat rates.',
    noteZh: '大氣再入走廊（月返約 11 km/s 量級——非認證）。不虛構 Starship 熱流表。',
    timeLabelEn: 'Entry',
    timeLabelZh: '再入',
  }
}

export function transferPathKm(segments = 256): THREE.Vector3[] {
  return buildTransferCurvePoints(segments)
}

export function returnPathKm(segments = 160): THREE.Vector3[] {
  return transferPathKm(segments)
    .map((p) => new THREE.Vector3(p.x, -p.y, 0))
    .reverse()
}

export function leoPathKm(segments = 128): THREE.Vector3[] {
  return buildLeoCurvePoints(segments)
}

export function lunarOrbitPathKm(segments = 128): THREE.Vector3[] {
  return buildLloCurvePoints(segments)
}

export function missionPathKm(samples = 400): { points: THREE.Vector3[]; kinds: PathKind[] } {
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
