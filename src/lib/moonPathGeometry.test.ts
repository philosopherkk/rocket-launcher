import { describe, expect, it } from 'vitest'
import {
  coastStateAt,
  loiPathStateAt,
  lunarOrbitStateAtTheta,
  MOON_TRANSFER_ACCURATE,
  transferStateAtNu,
} from './moonPathGeometry'
import { craftKmAt } from './craftKm'
import { TLI_DV_KM_S, LOI_DV_KM_S, LEO_SPEED_KM_S } from '../data/astroConstants'

describe('MOON_TRANSFER_ACCURATE', () => {
  it('has peri≈LEO and apo=Moon−LLO', () => {
    const T = MOON_TRANSFER_ACCURATE
    expect(T.rp).toBeCloseTo(6671, 0)
    expect(T.ra).toBeCloseTo(384400 - 1837.4, 0)
    expect(T.e).toBeGreaterThan(0.95)
    expect(T.e).toBeLessThan(1)
  })

  it('TLI Δv is Apollo-class ~3.1–3.2 km/s and matches astroConstants', () => {
    expect(MOON_TRANSFER_ACCURATE.tliDv).toBeGreaterThan(3.05)
    expect(MOON_TRANSFER_ACCURATE.tliDv).toBeLessThan(3.25)
    expect(MOON_TRANSFER_ACCURATE.tliDv).toBeCloseTo(TLI_DV_KM_S, 5)
  })

  it('LOI Δv is computed patched-conic ~0.7–1.0 km/s', () => {
    expect(MOON_TRANSFER_ACCURATE.loiDv).toBeGreaterThan(0.7)
    expect(MOON_TRANSFER_ACCURATE.loiDv).toBeLessThan(1.05)
    expect(MOON_TRANSFER_ACCURATE.loiDv).toBeCloseTo(LOI_DV_KM_S, 5)
  })
})

describe('Kepler transfer continuity', () => {
  it('apoapsis meets Earthward LLO point', () => {
    const apo = transferStateAtNu(Math.PI).position
    const llo0 = lunarOrbitStateAtTheta(0).position
    expect(apo.distanceTo(llo0)).toBeLessThan(1e-6)
  })

  it('vis-viva matches LEO and post-TLI speeds on HUD path', () => {
    const leo = craftKmAt(0.25)
    expect(leo.speedKmS).toBeCloseTo(LEO_SPEED_KM_S, 3)
    const tli = craftKmAt(0.339)
    expect(tli.speedKmS).toBeGreaterThan(LEO_SPEED_KM_S + 2.5)
    expect(tli.segment).toBe('TLI burn')
  })

  it('coast uses Kepler mean anomaly (speed falls toward apo)', () => {
    const early = coastStateAt(0.1)
    const late = coastStateAt(0.95)
    expect(late.speedKmS).toBeLessThan(early.speedKmS)
    expect(late.radiusKm).toBeGreaterThan(early.radiusKm)
  })

  it('LOI ends on circular LLO with matching speed', () => {
    const end = loiPathStateAt(1)
    const llo = lunarOrbitStateAtTheta(0.35)
    expect(end.position.distanceTo(llo.position)).toBeLessThan(1e-6)
    expect(end.speedKmS).toBeCloseTo(MOON_TRANSFER_ACCURATE.vLlo, 5)
    const orbit = craftKmAt(0.68)
    expect(orbit.segment).toBe('lunar orbit (LLO)')
    expect(orbit.speedKmS).toBeCloseTo(MOON_TRANSFER_ACCURATE.vLlo, 3)
    expect(orbit.periapsisKm).toBeCloseTo(orbit.apoapsisKm!, 3)
  })

  it('no straight-line jump from coast into LLO', () => {
    const a = craftKmAt(0.559)
    const b = craftKmAt(0.561)
    expect(a.position.distanceTo(b.position)).toBeLessThan(5000)
  })
})
