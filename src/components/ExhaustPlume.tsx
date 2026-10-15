import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = {
  intensity: number
  /** denser multi-engine look for booster */
  heavy?: boolean
}

/** Additive methalox-style plume clusters (stylized, not CFD). */
export function ExhaustPlume({ intensity, heavy = false }: Props) {
  const group = useRef<THREE.Group>(null)
  const mats = useMemo(() => {
    const core = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#e8f6ff'),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const mid = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#6eb8ff'),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const outer = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#3a7fff'),
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { core, mid, outer }
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const flicker = 0.92 + Math.sin(clock.elapsedTime * 38) * 0.05 + Math.sin(clock.elapsedTime * 67) * 0.03
    const i = intensity * flicker
    group.current.visible = i > 0.02
    group.current.scale.setScalar(0.85 + i * 0.35)
    mats.core.opacity = 0.55 * i
    mats.mid.opacity = 0.4 * i
    mats.outer.opacity = 0.22 * i
  })

  const engines = heavy
    ? [
        [0, 0],
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2
          return [Math.cos(a) * 0.28, Math.sin(a) * 0.28] as [number, number]
        }),
        ...Array.from({ length: 6 }, (_, k) => {
          const a = (k / 6) * Math.PI * 2 + 0.2
          return [Math.cos(a) * 0.48, Math.sin(a) * 0.48] as [number, number]
        }),
      ]
    : [
        [0, 0],
        ...Array.from({ length: 5 }, (_, k) => {
          const a = (k / 5) * Math.PI * 2
          return [Math.cos(a) * 0.22, Math.sin(a) * 0.22] as [number, number]
        }),
      ]

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {engines.map(([x, z], idx) => (
        <group key={idx} position={[x, 0, z]}>
          <mesh material={mats.outer} rotation={[Math.PI, 0, 0]} position={[0, -1.1, 0]}>
            <coneGeometry args={[0.16, 2.2, 10, 1, true]} />
          </mesh>
          <mesh material={mats.mid} rotation={[Math.PI, 0, 0]} position={[0, -0.75, 0]}>
            <coneGeometry args={[0.09, 1.5, 8, 1, true]} />
          </mesh>
          <mesh material={mats.core} rotation={[Math.PI, 0, 0]} position={[0, -0.45, 0]}>
            <coneGeometry args={[0.045, 0.9, 6, 1, true]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
