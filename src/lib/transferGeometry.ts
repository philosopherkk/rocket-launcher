import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  HELIO_A_AU,
  HELIO_BODY_EXAGGERATION,
  KM_PER_AU,
  LEO_ALTITUDE_KM,
  LEO_RADIUS_KM,
  LEO_SPEED_KM_S,
  MOON_DISTANCE_EARTH_RADII,
  MOON_DISTANCE_KM,
  MOON_RADIUS_EARTH,
  MU_EARTH_KM3_S2,
  MU_SUN_KM3_S2,
  type BodyId,
} from '../data/astroConstants'
import type { DestinationId } from '../data/destinations'
import { hohmannEarthTo } from '../data/orbital'
import { easeInOutCubic, clamp01 } from './ease'

export type PathSample = {
  /** Scene position */
  position: THREE.Vector3
  /** Tangent direction (unit) */
  tangent: THREE.Vector3
  label: string
  /** Measurements in physical units */
  altitudeKm: number | null
  radiusKm: number | null
  heliocentricAu: number | null
  speedKmS: number | null
  distanceTraveledKm: number
  distanceRemainingKm: number
  transferA_AU: number | null
  periapsisKm: number | null
  apoapsisKm: number | null
  noteEn: string
  noteZh: string
}

/** Scene units: cislunar uses R⊕=1; heliocentric uses AU=1 with body radii exaggerated. */
export const CISLUNAR_EARTH_R = 1

export function isCislunar(dest: DestinationId): boolean {
  return dest === 'moon'
}

export function targetHelioAu(dest: DestinationId): number {
  if (dest === 'moon') return 1
  if (dest === 'mars' || dest === 'venus' || dest === 'mercury' || dest === 'jupiter') {
    return HELIO_A_AU[dest]
  }
  return 1.524
}

export function bodyRadiusScene(body: BodyId, mode: 'cislunar' | 'helio'): number {
  const km = body === 'moon' ? MOON_RADIUS_EARTH * EARTH_RADIUS_KM : 
    body === 'earth' ? EARTH_RADIUS_KM :
    body === 'mars' ? 3389.5 :
    body === 'venus' ? 6051.8 :
    body === 'mercury' ? 2439.7 :
    body === 'jupiter' ? 69911 :
    695700
  if (mode === 'cislunar') {
    return km / EARTH_RADIUS_KM
  }
  // helio: true AU radius × exaggeration
  return (km / KM_PER_AU) * HELIO_BODY_EXAGGERATION
}

function visVivaEarth(rKm: number, aKm: number): number {
  return Math.sqrt(MU_EARTH_KM3_S2 * (2 / rKm - 1 / aKm))
}

function visVivaSun(rKm: number, aKm: number): number {
  return Math.sqrt(MU_SUN_KM3_S2 * (2 / rKm - 1 / aKm))
}

/** Map mission scrubber 0–1 onto a labeled teaching trajectory. */
export function samplePath(progress: number, destinationId: DestinationId): PathSample {
  const p = clamp01(progress)
  if (isCislunar(destinationId)) return sampleCislunar(p)
  return sampleHelio(p, destinationId)
}

function sampleCislunar(p: number): PathSample {
  const moon = new THREE.Vector3(MOON_DISTANCE_EARTH_RADII, 0, 0)
  const leoR = LEO_RADIUS_KM / EARTH_RADIUS_KM
  // Transfer ellipse: perigee LEO, apogee ~ Moon distance (patched-conic teaching model)
  const rp = LEO_RADIUS_KM
  const ra = MOON_DISTANCE_KM
  const aKm = (rp + ra) / 2
  const e = (ra - rp) / (ra + rp)
  const totalArcKm = Math.PI * aKm // half ellipse arc approx for progress mapping

  let position = new THREE.Vector3()
  let tangent = new THREE.Vector3(0, 1, 0)
  let label = 'pad'
  let altitudeKm: number | null = 0
  let speedKmS: number | null = 0
  let traveled = 0
  let noteEn = ''
  let noteZh = ''

  if (p < 0.08) {
    // Pad on Earth surface
    const lat = 0.35
    position.set(Math.sin(lat) * CISLUNAR_EARTH_R * 1.002, Math.cos(lat) * CISLUNAR_EARTH_R * 1.002, 0.15)
    tangent.set(position.x, position.y, 0).normalize()
    label = 'pad'
    altitudeKm = 0
    speedKmS = 0
    traveled = 0
    noteEn = 'Surface / pad (vehicle not to planet scale — use Vehicle mode)'
    noteZh = '地表／發射台（載具非行星比例——請用載具比例模式）'
  } else if (p < 0.2) {
    const u = easeInOutCubic((p - 0.08) / 0.12)
    const r = THREE.MathUtils.lerp(CISLUNAR_EARTH_R * 1.002, leoR, u)
    const ang = -0.4 + u * 0.9
    position.set(Math.cos(ang) * r, Math.sin(ang) * r, u * 0.2)
    tangent.set(-Math.sin(ang), Math.cos(ang), 0.05).normalize()
    label = 'ascent'
    altitudeKm = (r - 1) * EARTH_RADIUS_KM
    speedKmS = THREE.MathUtils.lerp(0.1, LEO_SPEED_KM_S * 0.85, u)
    traveled = u * altitudeKm * 1.2
    noteEn = 'Atmospheric ascent toward LEO altitude class (~300 km teaching value)'
    noteZh = '大氣層上升，朝近地軌道高度量級（教學值約 300 公里）'
  } else if (p < 0.32) {
    const u = (p - 0.2) / 0.12
    const ang = 0.5 + u * Math.PI * 1.2
    position.set(Math.cos(ang) * leoR, Math.sin(ang) * leoR, 0.15)
    tangent.set(-Math.sin(ang), Math.cos(ang), 0).normalize()
    label = 'LEO'
    altitudeKm = LEO_ALTITUDE_KM
    speedKmS = LEO_SPEED_KM_S
    traveled = 2 * Math.PI * LEO_RADIUS_KM * u * 0.3
    noteEn = 'Parking / LEO coast (circular teaching orbit)'
    noteZh = '停泊／近地軌道滑行（圓軌教學模型）'
  } else if (p < 0.62) {
    // Trans-lunar ellipse ν: 0 → π
    const u = easeInOutCubic((p - 0.32) / 0.3)
    const nu = u * Math.PI
    const rKm = (aKm * (1 - e * e)) / (1 + e * Math.cos(nu))
    const r = rKm / EARTH_RADIUS_KM
    // Orient ellipse with perigee near LEO departure along +x from Earth toward Moon
    position.set(Math.cos(nu) * r, Math.sin(nu) * r * 0.55, Math.sin(nu) * 0.08)
    // Blend toward Moon for approach end
    if (u > 0.85) {
      const w = (u - 0.85) / 0.15
      const nearMoon = moon.clone().add(new THREE.Vector3(-MOON_RADIUS_EARTH * 2.2, 0.3, 0.2))
      position.lerp(nearMoon, w)
    }
    const nextNu = Math.min(Math.PI, nu + 0.02)
    const r2 = ((aKm * (1 - e * e)) / (1 + e * Math.cos(nextNu))) / EARTH_RADIUS_KM
    const next = new THREE.Vector3(Math.cos(nextNu) * r2, Math.sin(nextNu) * r2 * 0.55, 0)
    tangent.copy(next.sub(position)).normalize()
    label = u < 0.15 ? 'TLI' : u > 0.85 ? 'lunar approach' : 'trans-lunar coast'
    altitudeKm = rKm - EARTH_RADIUS_KM
    speedKmS = visVivaEarth(rKm, aKm)
    traveled = u * totalArcKm
    noteEn = 'Patched-conic teaching transfer: LEO perigee → lunar-distance apogee'
    noteZh = '拼接圓錐教學轉移：近地軌道近地點 → 地月距離遠地點'
  } else if (p < 0.72) {
    const u = (p - 0.62) / 0.1
    const nearMoon = moon.clone().add(new THREE.Vector3(-MOON_RADIUS_EARTH * 1.4, 0.2, 0.15))
    position.copy(nearMoon)
    tangent.set(0, 1, 0)
    label = 'lunar surface'
    altitudeKm = 0
    speedKmS = 0
    traveled = totalArcKm
    noteEn = 'Lunar vicinity / surface (vacuum — no aero braking)'
    noteZh = '月球附近／月面（真空——無氣動減速）'
    void u
  } else if (p < 0.86) {
    const u = easeInOutCubic((p - 0.72) / 0.14)
    const nu = Math.PI * (1 - u)
    const rKm = (aKm * (1 - e * e)) / (1 + e * Math.cos(nu))
    const r = rKm / EARTH_RADIUS_KM
    position.set(Math.cos(nu) * r, -Math.sin(nu) * r * 0.55, 0.1)
    tangent.set(Math.sin(nu), -Math.cos(nu), 0).normalize()
    label = 'Earth return coast'
    altitudeKm = rKm - EARTH_RADIUS_KM
    speedKmS = visVivaEarth(rKm, aKm)
    traveled = totalArcKm + u * totalArcKm
    noteEn = 'Return leg along teaching transfer (symmetric schematic)'
    noteZh = '沿教學轉移的返回段（對稱示意）'
  } else {
    const u = easeInOutCubic((p - 0.86) / 0.14)
    const r = THREE.MathUtils.lerp(leoR * 1.8, CISLUNAR_EARTH_R * 1.01, u)
    const ang = -0.2 - u * 0.5
    position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0.1)
    tangent.copy(position).normalize().negate()
    label = 'entry corridor'
    altitudeKm = Math.max(0, (r - 1) * EARTH_RADIUS_KM)
    speedKmS = THREE.MathUtils.lerp(11, 0.2, u) // lunar-return class order → landing
    traveled = 2 * totalArcKm
    noteEn = 'Atmospheric entry corridor (order-of-magnitude speed; not a certified profile)'
    noteZh = '大氣再入走廊（速度數量級；非認證剖面）'
  }

  const remaining = Math.max(0, 2 * totalArcKm - traveled)
  return {
    position,
    tangent,
    label,
    altitudeKm,
    radiusKm: altitudeKm != null ? altitudeKm + EARTH_RADIUS_KM : null,
    heliocentricAu: null,
    speedKmS,
    distanceTraveledKm: traveled,
    distanceRemainingKm: remaining,
    transferA_AU: null,
    periapsisKm: rp,
    apoapsisKm: ra,
    noteEn,
    noteZh,
  }
}

function sampleHelio(p: number, destinationId: DestinationId): PathSample {
  const a2 = targetHelioAu(destinationId)
  const h = hohmannEarthTo(a2)
  const a = h.transferA_AU
  const e = Math.abs(a2 - 1) / (a2 + 1)

  // Outbound: ν 0→π on transfer; return schematic π→2π mirrored
  let nu = 0
  let label = 'helio'
  let noteEn = ''
  let noteZh = ''
  let traveledFrac = 0

  if (p < 0.08) {
    const er = bodyRadiusScene('earth', 'helio')
    return {
      position: new THREE.Vector3(1 + er * 1.2, er * 0.2, 0),
      tangent: new THREE.Vector3(0, 1, 0),
      label: 'Earth departure prep',
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: 1,
      speedKmS: 29.78,
      distanceTraveledKm: 0,
      distanceRemainingKm: Math.PI * a * KM_PER_AU,
      transferA_AU: a,
      periapsisKm: Math.min(1, a2) * KM_PER_AU,
      apoapsisKm: Math.max(1, a2) * KM_PER_AU,
      noteEn: 'Heliocentric view — vehicle is a marker (use Vehicle mode for rocket size)',
      noteZh: '日心視圖——載具為標記（火箭尺寸請用載具比例模式）',
    }
  } else if (p < 0.32) {
    // Escape / departure schematic near Earth
    const u = (p - 0.08) / 0.24
    const er = bodyRadiusScene('earth', 'helio')
    const ang = u * 0.4
    const r = 1 + er * (1.5 + u * 8)
    const position = new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * r * 0.3, 0)
    return {
      position,
      tangent: new THREE.Vector3(-Math.sin(ang), Math.cos(ang), 0).normalize(),
      label: 'Earth escape / TMI class',
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: r,
      speedKmS: 29.78 + h.dvDepart_kms * u,
      distanceTraveledKm: u * 0.05 * KM_PER_AU,
      distanceRemainingKm: Math.PI * a * KM_PER_AU,
      transferA_AU: a,
      periapsisKm: Math.min(1, a2) * KM_PER_AU,
      apoapsisKm: Math.max(1, a2) * KM_PER_AU,
      noteEn: `Ideal Hohmann depart Δv ~${h.dvDepart_kms.toFixed(2)} km/s (heliocentric circular model)`,
      noteZh: `理想霍曼出發 Δv 約 ${h.dvDepart_kms.toFixed(2)} km/s（日心圓軌模型）`,
    }
  } else if (p < 0.62) {
    const u = easeInOutCubic((p - 0.32) / 0.3)
    nu = u * Math.PI
    traveledFrac = u
    label = u < 0.08 ? 'departure burn arc' : u > 0.9 ? 'arrival approach' : 'Hohmann coast'
    noteEn = `Hohmann transfer a=${a.toFixed(3)} AU, one-way ~${Math.round(h.oneWayDays)} days (ideal)`
    noteZh = `霍曼轉移 a=${a.toFixed(3)} AU，單程約 ${Math.round(h.oneWayDays)} 日（理想）`
  } else if (p < 0.72) {
    const pr = bodyRadiusScene(
      destinationId === 'mars' || destinationId === 'venus' || destinationId === 'mercury' || destinationId === 'jupiter'
        ? destinationId
        : 'mars',
      'helio',
    )
    return {
      position: new THREE.Vector3(a2 - pr * 1.8, pr * 0.3, 0),
      tangent: new THREE.Vector3(0, 1, 0),
      label: 'destination vicinity',
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: a2,
      speedKmS: Math.sqrt(MU_SUN_KM3_S2 / (a2 * KM_PER_AU)),
      distanceTraveledKm: Math.PI * a * KM_PER_AU,
      distanceRemainingKm: Math.PI * a * KM_PER_AU,
      transferA_AU: a,
      periapsisKm: Math.min(1, a2) * KM_PER_AU,
      apoapsisKm: Math.max(1, a2) * KM_PER_AU,
      noteEn: `Circular heliocentric speed at ${a2} AU (order-of-magnitude)`,
      noteZh: `${a2} AU 處日心圓軌速度（數量級）`,
    }
  } else {
    const u = easeInOutCubic((p - 0.72) / 0.28)
    nu = Math.PI + u * Math.PI
    traveledFrac = 1 + u
    label = 'return Hohmann leg'
    noteEn = 'Symmetric teaching return on the transfer ellipse'
    noteZh = '轉移橢圓上的對稱教學回程'
  }

  const rAu = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
  // Ellipse in ecliptic plane; perihelion at Earth for outer targets
  const outer = a2 > 1
  const x = outer ? rAu * Math.cos(nu) : -rAu * Math.cos(nu)
  const y = rAu * Math.sin(nu) * 0.35
  const position = new THREE.Vector3(x, y, 0)
  const rKm = rAu * KM_PER_AU
  const aKm = a * KM_PER_AU
  const speed = visVivaSun(rKm, aKm)
  const arc = Math.PI * a * KM_PER_AU

  return {
    position,
    tangent: new THREE.Vector3(-Math.sin(nu), Math.cos(nu) * 0.35, 0).normalize(),
    label,
    altitudeKm: null,
    radiusKm: null,
    heliocentricAu: rAu,
    speedKmS: speed,
    distanceTraveledKm: traveledFrac * arc,
    distanceRemainingKm: Math.max(0, 2 * arc - traveledFrac * arc),
    transferA_AU: a,
    periapsisKm: Math.min(1, a2) * KM_PER_AU,
    apoapsisKm: Math.max(1, a2) * KM_PER_AU,
    noteEn,
    noteZh,
  }
}

export function transferCurvePoints(destinationId: DestinationId, segments = 96): THREE.Vector3[] {
  if (isCislunar(destinationId)) {
    const rp = LEO_RADIUS_KM
    const ra = MOON_DISTANCE_KM
    const aKm = (rp + ra) / 2
    const e = (ra - rp) / (ra + rp)
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const nu = (i / segments) * Math.PI
      const rKm = (aKm * (1 - e * e)) / (1 + e * Math.cos(nu))
      const r = rKm / EARTH_RADIUS_KM
      pts.push(new THREE.Vector3(Math.cos(nu) * r, Math.sin(nu) * r * 0.55, Math.sin(nu) * 0.05))
    }
    return pts
  }
  const a2 = targetHelioAu(destinationId)
  const h = hohmannEarthTo(a2)
  const a = h.transferA_AU
  const e = Math.abs(a2 - 1) / (a2 + 1)
  const outer = a2 > 1
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const nu = (i / segments) * Math.PI
    const rAu = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
    const x = outer ? rAu * Math.cos(nu) : -rAu * Math.cos(nu)
    const y = rAu * Math.sin(nu) * 0.35
    pts.push(new THREE.Vector3(x, y, 0))
  }
  return pts
}

export function leoCirclePoints(segments = 64): THREE.Vector3[] {
  const r = LEO_RADIUS_KM / EARTH_RADIUS_KM
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.12))
  }
  return pts
}

export function formatKm(km: number, locale: 'en' | 'zh-Hant'): string {
  if (km >= 1_000_000) {
    const au = km / KM_PER_AU
    return locale === 'en' ? `${au.toFixed(3)} AU (${(km / 1e6).toFixed(2)} Mkm)` : `${au.toFixed(3)} AU（${(km / 1e6).toFixed(2)} 百萬公里）`
  }
  if (km >= 10_000) {
    return locale === 'en' ? `${(km / 1000).toFixed(0)} ×10³ km` : `${(km / 1000).toFixed(0)} ×10³ 公里`
  }
  return locale === 'en' ? `${km.toFixed(0)} km` : `${km.toFixed(0)} 公里`
}

export function formatSpeed(v: number, locale: 'en' | 'zh-Hant'): string {
  return locale === 'en' ? `~${v.toFixed(2)} km/s` : `約 ${v.toFixed(2)} km/s`
}
