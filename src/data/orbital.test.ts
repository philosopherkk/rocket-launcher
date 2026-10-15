import { describe, expect, it } from 'vitest'
import { departureFromLeoDv, hohmannEarthTo } from './orbital'
import { helioHohmannFrame, transferPosAtNu } from '../lib/transferGeometry'
import { planetHelioPosition } from '../lib/transferGeometry'

const TABLE = [
  { name: 'mars', au: 1.524, depart: 2.95, arrive: 2.64, days: 259 },
  { name: 'venus', au: 0.723, depart: 2.5, arrive: 2.71, days: 146 },
  { name: 'mercury', au: 0.387, depart: 7.53, arrive: 9.62, days: 105 },
  { name: 'jupiter', au: 5.203, depart: 8.79, arrive: 5.64, days: 997 },
] as const

describe('hohmannEarthTo', () => {
  for (const row of TABLE) {
    it(`${row.name} matches teaching table (±1%)`, () => {
      const h = hohmannEarthTo(row.au)
      expect(h.dvDepart_kms).toBeCloseTo(row.depart, 1)
      expect(h.dvArrive_kms).toBeCloseTo(row.arrive, 1)
      expect(h.oneWayDays).toBeGreaterThan(row.days * 0.99)
      expect(h.oneWayDays).toBeLessThan(row.days * 1.01)
    })
  }

  it('arrival ν places craft at target planet longitude', () => {
    const dest = 'mars' as const
    const frame = helioHohmannFrame(dest)
    const craft = transferPosAtNu(frame.nuEnd, frame)
    const planet = planetHelioPosition(dest, 0.95, dest)
    const angCraft = Math.atan2(craft.y, craft.x)
    const angPlanet = Math.atan2(planet.y, planet.x)
    let d = Math.abs(angCraft - angPlanet)
    if (d > Math.PI) d = 2 * Math.PI - d
    expect(d).toBeLessThan(0.05)
  })
})

describe('departureFromLeoDv', () => {
  it('is positive for Mars-class v∞', () => {
    const h = hohmannEarthTo(1.524)
    const dv = departureFromLeoDv(h.dvDepart_kms)
    expect(dv).toBeGreaterThan(2)
    expect(dv).toBeLessThan(6)
  })
})
