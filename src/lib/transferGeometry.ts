import * as THREE from 'three'
import {
  EARTH_RADIUS_KM,
  HELIO_A_AU,
  HELIO_BODY_EXAGGERATION,
  HELIO_LONGITUDE_ASSUMPTION_EN,
  HELIO_LONGITUDE_ASSUMPTION_ZH,
  HELIO_MEAN_LONG_DEG_J2000,
  KM_PER_AU,
  LEO_RADIUS_KM,
  MOON_DISTANCE_KM,
  MOON_RADIUS_EARTH,
  MU_SUN_KM3_S2,
  type BodyId,
} from '../data/astroConstants'
import type { DestinationId } from '../data/destinations'
import { hohmannEarthTo } from '../data/orbital'
import { easeInOutCubic, clamp01 } from './ease'
import { craftKmAt, MOON_TRANSFER, type PathKind } from './craftKm'

const DEG = Math.PI / 180

function polarAu(rAu: number, lonRad: number): THREE.Vector3 {
  return new THREE.Vector3(rAu * Math.cos(lonRad), rAu * Math.sin(lonRad), 0)
}

function orbitalPeriodDays(aAu: number): number {
  return 365.25 * Math.pow(aAu, 1.5)
}

/** Hohmann frame: Earth fixed at J2000 mean longitude; transfer periapsis oriented for one-way coast. */
export function helioHohmannFrame(destinationId: DestinationId) {
  const a2 = targetHelioAu(destinationId)
  const h = hohmannEarthTo(a2)
  const a = h.transferA_AU
  const e = Math.abs(a2 - 1) / (a2 + 1)
  const outer = a2 > 1
  const LEarth = HELIO_MEAN_LONG_DEG_J2000.earth * DEG
  const LArrive = LEarth + Math.PI
  const LPeri = outer ? LEarth : LArrive
  const nuStart = outer ? 0 : Math.PI
  const nuEnd = outer ? Math.PI : Math.PI * 2
  const nTarget = (2 * Math.PI) / orbitalPeriodDays(a2)
  const deltaTarget = nTarget * h.oneWayDays
  const LTargetDepart = LArrive - deltaTarget
  return {
    a2,
    h,
    a,
    e,
    outer,
    LEarth,
    LArrive,
    LPeri,
    nuStart,
    nuEnd,
    LTargetDepart,
    days: h.oneWayDays,
  }
}

export function transferPosAtNu(
  nu: number,
  frame: ReturnType<typeof helioHohmannFrame>,
): THREE.Vector3 {
  const { a, e, LPeri } = frame
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
  return polarAu(r, LPeri + nu)
}

/**
 * Heliocentric planet position (AU) for teaching views.
 * Non-target bodies: fixed J2000 mean longitudes on circular mean-a orbits.
 * Target: advances from Hohmann-departure longitude → arrival longitude with progress.
 * Earth stays at the teaching departure longitude for the outbound leg.
 */
export function planetHelioPosition(
  id: HelioPlanetId,
  progress: number,
  destinationId: DestinationId,
): THREE.Vector3 {
  const a = HELIO_A_AU[id]
  if (id === 'earth') {
    return polarAu(a, HELIO_MEAN_LONG_DEG_J2000.earth * DEG)
  }
  if (id === destinationId) {
    const frame = helioHohmannFrame(destinationId)
    const p = clamp01(progress)
    let u = 0
    if (p < 0.08) u = 0
    else if (p < 0.16) u = 0
    else if (p < 0.9) u = easeInOutCubic((p - 0.16) / 0.74)
    else u = 1
    const lon = THREE.MathUtils.lerp(frame.LTargetDepart, frame.LArrive, u)
    return polarAu(a, lon)
  }
  return polarAu(a, HELIO_MEAN_LONG_DEG_J2000[id] * DEG)
}

export type PathSample = {
  position: THREE.Vector3
  tangent: THREE.Vector3
  label: string
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
  kind: PathKind
  beginnerCaptionEn: string
  beginnerCaptionZh: string
  timeLabelEn: string
  timeLabelZh: string
}

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

export type HelioPlanetId = keyof typeof HELIO_A_AU

export const HELIO_PLANETS: HelioPlanetId[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter']

export function bodyRadiusScene(body: BodyId, mode: 'cislunar' | 'helio'): number {
  const km =
    body === 'moon'
      ? MOON_RADIUS_EARTH * EARTH_RADIUS_KM
      : body === 'earth'
        ? EARTH_RADIUS_KM
        : body === 'mars'
          ? 3389.5
          : body === 'venus'
            ? 6051.8
            : body === 'mercury'
              ? 2439.7
              : body === 'jupiter'
                ? 69911
                : 695700
  if (mode === 'cislunar') return km / EARTH_RADIUS_KM
  return (km / KM_PER_AU) * HELIO_BODY_EXAGGERATION
}

function visVivaSun(rKm: number, aKm: number): number {
  return Math.sqrt(MU_SUN_KM3_S2 * (2 / rKm - 1 / aKm))
}

export function samplePath(progress: number, destinationId: DestinationId): PathSample {
  const p = clamp01(progress)
  if (isCislunar(destinationId)) return sampleCislunar(p)
  return sampleHelio(p, destinationId)
}

function sampleCislunar(p: number): PathSample {
  const c = craftKmAt(p)
  const { a } = MOON_TRANSFER
  const coastArc = Math.PI * a
  let traveled = 0
  if (p < 0.08) traveled = 0
  else if (p < 0.2) traveled = ((p - 0.08) / 0.12) * LEO_RADIUS_KM * 0.5
  else if (p < 0.32) traveled = LEO_RADIUS_KM * 0.5 + ((p - 0.2) / 0.12) * Math.PI * LEO_RADIUS_KM * 0.15
  else if (p < 0.62) traveled = LEO_RADIUS_KM + ((p - 0.32) / 0.3) * coastArc
  else if (p < 0.72) traveled = LEO_RADIUS_KM + coastArc
  else if (p < 0.86) traveled = LEO_RADIUS_KM + coastArc + ((p - 0.72) / 0.14) * coastArc
  else traveled = LEO_RADIUS_KM + 2 * coastArc

  const captions: Record<string, { en: string; zh: string }> = {
    pad: { en: 'On the pad — ready for liftoff', zh: '在發射台上——準備起飛' },
    'ascent / gravity turn': { en: 'Climbing and pitching into LEO', zh: '上升並轉向進入近地軌道' },
    'LEO parking': { en: 'Coasting in circular LEO', zh: '在近地圓軌停泊滑行' },
    'TLI burn': { en: 'TLI — raising apoapsis toward the Moon', zh: 'TLI——把遠地點推向月球' },
    'trans-lunar coast': { en: 'Whole outbound coast on the transfer ellipse', zh: '整段地月轉移橢圓巡航' },
    'lunar approach': { en: 'Approaching the Moon near apoapsis', zh: '接近遠地點附近的月球' },
    'lunar orbit / vicinity': { en: 'Near the Moon', zh: '月球附近' },
    'Earth-return coast': { en: 'Returning to Earth on the ellipse', zh: '沿橢圓返回地球' },
    'entry corridor': { en: 'Entering Earth’s atmosphere', zh: '進入地球大氣' },
  }
  const cap = captions[c.segment] ?? { en: c.segment, zh: c.segment }

  return {
    position: c.position.clone(),
    tangent: c.tangent.clone(),
    label: c.segment,
    altitudeKm: c.altitudeKm,
    radiusKm: c.radiusKm,
    heliocentricAu: null,
    speedKmS: c.speedKmS,
    distanceTraveledKm: traveled,
    distanceRemainingKm: Math.max(0, LEO_RADIUS_KM + 2 * coastArc - traveled),
    transferA_AU: null,
    periapsisKm: c.periapsisKm,
    apoapsisKm: c.apoapsisKm,
    noteEn: c.noteEn,
    noteZh: c.noteZh,
    kind: c.kind,
    beginnerCaptionEn: cap.en,
    beginnerCaptionZh: cap.zh,
    timeLabelEn: c.timeLabelEn,
    timeLabelZh: c.timeLabelZh,
  }
}

/**
 * Idealized circular coplanar Hohmann (AU) — one-way Earth → target only.
 * Transfer oriented from Earth’s J2000 mean longitude; scrubber = depart → coast → arrive.
 */
function sampleHelio(p: number, destinationId: DestinationId): PathSample {
  const frame = helioHohmannFrame(destinationId)
  const { a2, h, a, nuStart, nuEnd, days, LEarth } = frame
  const assume = `Ideal one-way Hohmann: circular coplanar, Sun two-body only (teaching — not flown). ${HELIO_LONGITUDE_ASSUMPTION_EN}`
  const assumeZh = `理想單程霍曼：圓形共面、僅日心二體（教學——非真實飛行）。${HELIO_LONGITUDE_ASSUMPTION_ZH}`
  const coastKm = Math.PI * a * KM_PER_AU
  const periKm = Math.min(1, a2) * KM_PER_AU
  const apoKm = Math.max(1, a2) * KM_PER_AU

  const tangentAt = (nu: number) => {
    const d = 0.01
    const p0 = transferPosAtNu(nu, frame)
    const p1 = transferPosAtNu(Math.min(nuEnd, nu + d), frame)
    return p1.sub(p0).normalize()
  }

  // 0–0.08 pre-depart at Earth
  if (p < 0.08) {
    const position = polarAu(1, LEarth)
    return {
      position,
      tangent: new THREE.Vector3(-Math.sin(LEarth), Math.cos(LEarth), 0).normalize(),
      label: 'Earth orbit (pre-depart)',
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: 1,
      speedKmS: 29.78,
      distanceTraveledKm: 0,
      distanceRemainingKm: coastKm,
      transferA_AU: a,
      periapsisKm: periKm,
      apoapsisKm: apoKm,
      noteEn: assume,
      noteZh: assumeZh,
      kind: 'coast',
      beginnerCaptionEn: 'In Earth’s solar orbit before departure',
      beginnerCaptionZh: '出發前在地球的太陽軌道',
      timeLabelEn: 'Day 0',
      timeLabelZh: '第 0 日',
    }
  }

  // 0.08–0.16 departure burn
  if (p < 0.16) {
    const u = (p - 0.08) / 0.08
    const nu = THREE.MathUtils.lerp(nuStart, nuStart + (nuEnd - nuStart) * 0.04, u)
    const position = transferPosAtNu(nu, frame)
    return {
      position,
      tangent: tangentAt(nu),
      label: 'departure burn',
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: position.length(),
      speedKmS: 29.78 + h.dvDepart_kms * u,
      distanceTraveledKm: u * 0.02 * KM_PER_AU,
      distanceRemainingKm: coastKm,
      transferA_AU: a,
      periapsisKm: periKm,
      apoapsisKm: apoKm,
      noteEn: `Depart Δv ~${h.dvDepart_kms.toFixed(2)} km/s. ${assume}`,
      noteZh: `出發 Δv 約 ${h.dvDepart_kms.toFixed(2)} km/s。${assumeZh}`,
      kind: 'powered',
      beginnerCaptionEn: 'Departure burn onto the Hohmann ellipse',
      beginnerCaptionZh: '出發點火進入霍曼橢圓',
      timeLabelEn: 'Depart',
      timeLabelZh: '出發',
    }
  }

  // 0.16–0.90 whole outbound coast (majority of scrubber)
  if (p < 0.9) {
    const u = easeInOutCubic((p - 0.16) / 0.74)
    const nu = THREE.MathUtils.lerp(nuStart + (nuEnd - nuStart) * 0.04, nuEnd, u)
    const position = transferPosAtNu(nu, frame)
    const rKm = position.length() * KM_PER_AU
    const day = (u * days).toFixed(0)
    const label = u > 0.94 ? 'arrival approach' : 'Hohmann coast'
    return {
      position,
      tangent: tangentAt(nu),
      label,
      altitudeKm: null,
      radiusKm: null,
      heliocentricAu: position.length(),
      speedKmS: visVivaSun(rKm, a * KM_PER_AU),
      distanceTraveledKm: u * coastKm,
      distanceRemainingKm: (1 - u) * coastKm,
      transferA_AU: a,
      periapsisKm: periKm,
      apoapsisKm: apoKm,
      noteEn: `Hohmann coast a=${a.toFixed(3)} AU · ~${Math.round(days)} d one-way. ${assume}`,
      noteZh: `霍曼巡航 a=${a.toFixed(3)} AU · 單程約 ${Math.round(days)} 日。${assumeZh}`,
      kind: 'coast',
      beginnerCaptionEn: `Coasting the whole way to ${destinationId} (~${Math.round(days)} days)`,
      beginnerCaptionZh: `全程巡航前往 ${destinationId}（約 ${Math.round(days)} 日）`,
      timeLabelEn: `Day ~${day} / ${Math.round(days)}`,
      timeLabelZh: `約第 ${day} / ${Math.round(days)} 日`,
    }
  }

  // 0.90–1.00 arrival burn — end of one-way timeline
  const u = (p - 0.9) / 0.1
  const position = transferPosAtNu(nuEnd, frame)
  return {
    position,
    tangent: new THREE.Vector3(-Math.sin(frame.LArrive), Math.cos(frame.LArrive), 0).normalize(),
    label: u < 0.5 ? 'arrival burn' : 'arrived',
    altitudeKm: null,
    radiusKm: null,
    heliocentricAu: a2,
    speedKmS: Math.sqrt(MU_SUN_KM3_S2 / (a2 * KM_PER_AU)),
    distanceTraveledKm: coastKm,
    distanceRemainingKm: 0,
    transferA_AU: a,
    periapsisKm: periKm,
    apoapsisKm: apoKm,
    noteEn: `Arrive Δv ~${h.dvArrive_kms.toFixed(2)} km/s at ${a2} AU (one-way). ${assume}`,
    noteZh: `到達 Δv 約 ${h.dvArrive_kms.toFixed(2)} km/s（${a2} AU，單程）。${assumeZh}`,
    kind: 'powered',
    beginnerCaptionEn: `Arrival burn at ${destinationId}`,
    beginnerCaptionZh: `在 ${destinationId} 到達點火`,
    timeLabelEn: `Day ~${Math.round(days)}`,
    timeLabelZh: `約第 ${Math.round(days)} 日`,
  }
}

export function transferCurvePoints(destinationId: DestinationId, segments = 140): THREE.Vector3[] {
  if (isCislunar(destinationId)) {
    const { a, e } = MOON_TRANSFER
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const nu = (i / segments) * Math.PI
      const rKm = (a * (1 - e * e)) / (1 + e * Math.cos(nu))
      const r = rKm / EARTH_RADIUS_KM
      pts.push(new THREE.Vector3(-Math.cos(nu) * r, Math.sin(nu) * r, 0))
    }
    return pts
  }
  const frame = helioHohmannFrame(destinationId)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const nu = THREE.MathUtils.lerp(frame.nuStart, frame.nuEnd, i / segments)
    pts.push(transferPosAtNu(nu, frame))
  }
  return pts
}

/** Helio mission path samples for powered/coast coloring. */
export function helioMissionPath(
  destinationId: DestinationId,
  samples = 200,
): { points: THREE.Vector3[]; kinds: PathKind[] } {
  const points: THREE.Vector3[] = []
  const kinds: PathKind[] = []
  for (let i = 0; i <= samples; i++) {
    const s = samplePath(i / samples, destinationId)
    points.push(s.position.clone())
    kinds.push(s.kind)
  }
  return { points, kinds }
}

export function planetOrbitRing(aAu: number, segments = 96): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const th = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(th) * aAu, Math.sin(th) * aAu, 0))
  }
  return pts
}

export function leoCirclePoints(segments = 64): THREE.Vector3[] {
  const r = LEO_RADIUS_KM / EARTH_RADIUS_KM
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
  }
  return pts
}

export function formatKm(km: number, locale: 'en' | 'zh-Hant'): string {
  if (km >= 1_000_000) {
    const au = km / KM_PER_AU
    return locale === 'en'
      ? `${au.toFixed(3)} AU (${(km / 1e6).toFixed(2)} Mkm)`
      : `${au.toFixed(3)} AU（${(km / 1e6).toFixed(2)} 百萬公里）`
  }
  if (km >= 10_000) {
    return locale === 'en' ? `${(km / 1000).toFixed(0)} ×10³ km` : `${(km / 1000).toFixed(0)} ×10³ 公里`
  }
  return locale === 'en' ? `${km.toFixed(0)} km` : `${km.toFixed(0)} 公里`
}

export function formatSpeed(v: number, locale: 'en' | 'zh-Hant'): string {
  return locale === 'en' ? `~${v.toFixed(2)} km/s` : `約 ${v.toFixed(2)} km/s`
}

// Silence unused import when tree-shaken oddly
void MOON_DISTANCE_KM
