import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('strict implicit any', () => {
  it('fails the fixture TypeScript 5.9.3 accepted when strict was omitted', () => {
    const tsc = path.resolve('node_modules/typescript/bin/tsc')
    const config = path.resolve('fixtures/implicit-any/tsconfig.json')
    let output = ''
    let status = 0
    try {
      output = execFileSync(tsc, ['-p', config, '--pretty', 'false'], { encoding: 'utf8' })
    } catch (error) {
      const failed = error as { status?: number; stdout?: string; stderr?: string }
      status = failed.status ?? 1
      output = `${failed.stdout ?? ''}${failed.stderr ?? ''}`
    }
    expect(status).not.toBe(0)
    expect(output).toContain('TS7006')
    expect(output).toContain('TS2322')
  })
})
