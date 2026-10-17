import { describe, expect, it } from 'vitest'
import { copyLink } from '../components/Timeline'
import { phaseAtProgress, type Difficulty } from './phases'
import type { DestinationId } from './destinations'

const HELIO: DestinationId[] = ['mars', 'venus', 'mercury', 'jupiter']

describe('phaseAtProgress', () => {
  it('progress 1 does not return prelaunch', () => {
    for (const destinationId of HELIO) {
      const phase = phaseAtProgress(1, destinationId)
      expect(phase.id).not.toBe('prelaunch')
      expect(phase.id).toBe('surface')
    }
    expect(phaseAtProgress(1, 'moon').id).toBe('reentry')
  })

  it('keeps interior bands half-open', () => {
    expect(phaseAtProgress(0, 'moon').id).toBe('prelaunch')
    expect(phaseAtProgress(0.08, 'moon').id).toBe('ascent')
    expect(phaseAtProgress(0.76, 'moon').id).toBe('return')
    expect(phaseAtProgress(0.999, 'moon').id).toBe('reentry')
    expect(phaseAtProgress(0.999, 'mars').id).toBe('surface')
    expect(phaseAtProgress(0.76, 'mars').id).toBe('surface')
  })
})

describe('copyLink', () => {
  it('writes the current difficulty', () => {
    const levels: Difficulty[] = ['beginner', 'intermediate', 'advanced']
    for (const difficulty of levels) {
      const url = copyLink('mars', 'zh-Hant', difficulty)
      const level = new URL(url, 'https://example.test').searchParams.get('level')
      expect(level).toBe(difficulty)
    }
    expect(copyLink('mars', 'en', 'advanced')).not.toContain('level=beginner')
  })
})
