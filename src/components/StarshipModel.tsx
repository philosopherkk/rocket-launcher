import { useMemo } from 'react'
import * as THREE from 'three'

type Props = {
  /** 0 = full stack with booster, 1 = ship only */
  shipOnly: boolean
  enginesLit: boolean
  scale?: number
}

/** Simplified stainless-steel Starship / Super Heavy silhouette (not CAD-accurate). */
export function StarshipModel({ shipOnly, enginesLit, scale = 1 }: Props) {
  const steel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c5cdd4',
        metalness: 0.85,
        roughness: 0.35,
      }),
    [],
  )
  const dark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a2e33',
        metalness: 0.4,
        roughness: 0.7,
      }),
    [],
  )
  const tile = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3d342c',
        metalness: 0.1,
        roughness: 0.9,
      }),
    [],
  )
  const flame = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#7ec8ff',
        transparent: true,
        opacity: 0.85,
      }),
    [],
  )

  return (
    <group scale={scale}>
      {/* Ship body */}
      <mesh position={[0, shipOnly ? 0 : 3.6, 0]} material={steel}>
        <cylinderGeometry args={[0.45, 0.5, 4.2, 24]} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, shipOnly ? 2.55 : 6.15, 0]} material={steel}>
        <coneGeometry args={[0.45, 1.1, 24]} />
      </mesh>
      {/* Heat-shield belly suggestion (windward tiles) */}
      <mesh
        position={[0.28, shipOnly ? 0 : 3.6, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={tile}
      >
        <planeGeometry args={[0.95, 3.8]} />
      </mesh>
      {/* Flaps */}
      <mesh position={[0.55, shipOnly ? -1.4 : 2.2, 0]} rotation={[0, 0, 0.4]} material={dark}>
        <boxGeometry args={[0.55, 0.08, 0.7]} />
      </mesh>
      <mesh position={[-0.55, shipOnly ? -1.4 : 2.2, 0]} rotation={[0, 0, -0.4]} material={dark}>
        <boxGeometry args={[0.55, 0.08, 0.7]} />
      </mesh>
      <mesh position={[0.4, shipOnly ? 1.6 : 5.2, 0]} rotation={[0, 0, 0.5]} material={dark}>
        <boxGeometry args={[0.35, 0.06, 0.45]} />
      </mesh>
      <mesh position={[-0.4, shipOnly ? 1.6 : 5.2, 0]} rotation={[0, 0, -0.5]} material={dark}>
        <boxGeometry args={[0.35, 0.06, 0.45]} />
      </mesh>

      {!shipOnly && (
        <group>
          {/* Super Heavy */}
          <mesh position={[0, -1.1, 0]} material={steel}>
            <cylinderGeometry args={[0.5, 0.55, 5.2, 24]} />
          </mesh>
          <mesh position={[0, -3.85, 0]} material={dark}>
            <cylinderGeometry args={[0.55, 0.58, 0.35, 24]} />
          </mesh>
        </group>
      )}

      {enginesLit && (
        <group position={[0, shipOnly ? -2.3 : -4.2, 0]}>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.18, -0.55, Math.sin(a) * 0.18]} material={flame}>
                <coneGeometry args={[0.08, 1.1, 8]} />
              </mesh>
            )
          })}
          {!shipOnly &&
            [0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2
              return (
                <mesh key={`b-${i}`} position={[Math.cos(a) * 0.32, -0.7, Math.sin(a) * 0.32]} material={flame}>
                  <coneGeometry args={[0.1, 1.4, 8]} />
                </mesh>
              )
            })}
        </group>
      )}
    </group>
  )
}
