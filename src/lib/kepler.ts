/** Kepler helpers for teaching coast segments (mean anomaly → eccentric anomaly → true anomaly). */

export function eccentricAnomalyFromNu(nu: number, e: number): number {
  const tanHalf = Math.tan(nu / 2)
  const denom = Math.sqrt((1 - e) / (1 + e))
  return 2 * Math.atan2(tanHalf * denom, 1)
}

export function meanAnomalyFromNu(nu: number, e: number): number {
  const E = eccentricAnomalyFromNu(nu, e)
  return E - e * Math.sin(E)
}

export function solveKeplerE(M: number, e: number, iterations = 12): number {
  const twoPi = Math.PI * 2
  let m = M % twoPi
  if (m < 0) m += twoPi
  let E = e < 0.8 ? m : Math.PI
  for (let i = 0; i < iterations; i++) {
    const f = E - e * Math.sin(E) - m
    const fp = 1 - e * Math.cos(E)
    E -= f / fp
  }
  return E
}

export function nuFromE(E: number, e: number): number {
  const sinE = Math.sin(E)
  const cosE = Math.cos(E)
  const sinNu = (Math.sqrt(1 - e * e) * sinE) / (1 - e * cosE)
  const cosNu = (cosE - e) / (1 - e * cosE)
  return Math.atan2(sinNu, cosNu)
}

/** Linear mean-anomaly coast: s∈[0,1] maps M from M(nu0) to M(nu1). */
export function nuFromMeanAnomalyCoast(s: number, nu0: number, nu1: number, e: number): number {
  const t = Math.min(1, Math.max(0, s))
  const M0 = meanAnomalyFromNu(nu0, e)
  const M1 = meanAnomalyFromNu(nu1, e)
  const M = M0 + (M1 - M0) * t
  const E = solveKeplerE(M, e)
  return nuFromE(E, e)
}
