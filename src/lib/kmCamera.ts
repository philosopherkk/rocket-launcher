import {
  EARTH_RADIUS_KM,
  LEO_ALTITUDE_KM,
  MOON_DISTANCE_KM,
  MOON_RADIUS_KM,
  STACK_HEIGHT_M,
} from '../data/astroConstants'

/** Scene units = kilometres (true teaching scale). */
export const KM = 1

export const EARTH_R_KM = EARTH_RADIUS_KM
export const MOON_R_KM = MOON_RADIUS_KM
export const MOON_DIST_KM = MOON_DISTANCE_KM
export const STACK_KM = STACK_HEIGHT_M / 1000

/**
 * StarshipModel stack ≈ 12.35 local units at scale=1.
 * Multiply by this to place the stack at STACK_KM in the km scene.
 */
export const SHIP_MODEL_TO_KM = STACK_KM / 12.35

/** log10(camera stand-off km): ~50 m → ~1e6 km (pad ↔ ~2.6× Earth–Moon) */
export const LOG_DIST_MIN = Math.log10(0.05)
export const LOG_DIST_MAX = Math.log10(1_000_000)
export const LOG_DIST_STEP = 0.22

export function clampLogDist(v: number): number {
  return Math.min(LOG_DIST_MAX, Math.max(LOG_DIST_MIN, v))
}

export function logDistToKm(logDist: number): number {
  return 10 ** clampLogDist(logDist)
}

export function kmToLogDist(km: number): number {
  return clampLogDist(Math.log10(Math.max(0.05, km)))
}

/**
 * Segment-aware stand-off so the craft stays visible through the whole transit.
 * Coast phases grow with geocentric r but stay craft-centered.
 */
export function autoDistanceKm(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  if (p < 0.08) return 0.9 // pad
  if (p < 0.2) return 8 + ((p - 0.08) / 0.12) * 220 // ascent
  if (p < 0.32) return 400 + ((p - 0.2) / 0.12) * 2_200 // LEO
  if (p < 0.36) return 2_500 // TLI — see burn + Earth limb
  if (p < 0.62) {
    // Outbound coast — frame craft; stand-off tracks transfer radius
    const u = (p - 0.36) / 0.26
    return 8_000 + u * 220_000
  }
  if (p < 0.72) return 12_000 // lunar vicinity
  if (p < 0.86) {
    const u = (p - 0.72) / 0.14
    return 15_000 + (1 - u) * 200_000 // return — pull in toward Earth
  }
  return 8 + ((p - 0.86) / 0.14) * 80 // entry
}

export function formatCameraDistance(km: number, locale: 'en' | 'zh-Hant'): string {
  if (km < 1) {
    const m = km * 1000
    return locale === 'en' ? `~${m.toFixed(0)} m` : `約 ${m.toFixed(0)} 公尺`
  }
  if (km < 1000) {
    return locale === 'en' ? `~${km.toFixed(1)} km` : `約 ${km.toFixed(1)} 公里`
  }
  if (km < MOON_DIST_KM * 0.5) {
    return locale === 'en'
      ? `~${(km / 1000).toFixed(0)} ×10³ km (${(km / EARTH_R_KM).toFixed(1)} R⊕)`
      : `約 ${(km / 1000).toFixed(0)} ×10³ 公里（${(km / EARTH_R_KM).toFixed(1)} R⊕）`
  }
  return locale === 'en'
    ? `~${(km / 1000).toFixed(0)} ×10³ km (${(km / MOON_DIST_KM).toFixed(2)}× Earth–Moon)`
    : `約 ${(km / 1000).toFixed(0)} ×10³ 公里（${(km / MOON_DIST_KM).toFixed(2)}× 地月距）`
}

export function formatAltitudeScale(altKm: number | null, locale: 'en' | 'zh-Hant'): string {
  if (altKm == null) return locale === 'en' ? '—' : '—'
  if (altKm < 1) {
    return locale === 'en' ? `alt ~${(altKm * 1000).toFixed(0)} m` : `高度約 ${(altKm * 1000).toFixed(0)} 公尺`
  }
  if (Math.abs(altKm - LEO_ALTITUDE_KM) < 40) {
    return locale === 'en'
      ? `alt ~${altKm.toFixed(0)} km (LEO class)`
      : `高度約 ${altKm.toFixed(0)} 公里（近地軌道量級）`
  }
  return locale === 'en' ? `alt ~${altKm.toFixed(0)} km` : `高度約 ${altKm.toFixed(0)} 公里`
}

/** Show detailed mesh when camera is close enough that the stack subtends usefully. */
export function showDetailedShip(cameraDistKm: number): boolean {
  return cameraDistKm < 120
}
