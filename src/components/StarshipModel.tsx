import { useMemo } from 'react'
import * as THREE from 'three'
import { ExhaustPlume } from './ExhaustPlume'
import { makeSteelTexture, makeTileTexture } from '../lib/textures'

type Props = {
  /** ship-only vs full stack */
  shipOnly?: boolean
  /** 0–1 plume intensity */
  plume?: number
  /** render booster half only (for separating stage) */
  boosterOnly?: boolean
  scale?: number
}

/**
 * Educational Starship / Super Heavy silhouette.
 * Proportions roughly track public 9 m diameter / 52 m ship / 72 m booster ratios —
 * not proprietary CAD.
 */
export function StarshipModel({
  shipOnly = false,
  plume = 0,
  boosterOnly = false,
  scale = 1,
}: Props) {
  const steelMap = useMemo(() => makeSteelTexture(), [])
  const tileMap = useMemo(() => makeTileTexture(), [])

  const steel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cfd6dd',
        map: steelMap,
        metalness: 0.92,
        roughness: 0.28,
        envMapIntensity: 1.1,
      }),
    [steelMap],
  )
  const steelDark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8a929a',
        metalness: 0.88,
        roughness: 0.4,
      }),
    [],
  )
  const tile = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3a322b',
        map: tileMap,
        metalness: 0.08,
        roughness: 0.92,
      }),
    [tileMap],
  )
  const nozzle = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6b4a32',
        metalness: 0.75,
        roughness: 0.45,
      }),
    [],
  )
  const nozzleVac = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5a4030',
        metalness: 0.7,
        roughness: 0.5,
      }),
    [],
  )
  const dark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1c1f24',
        metalness: 0.55,
        roughness: 0.55,
      }),
    [],
  )

  // Diameter unit ≈ 0.9 → ship ~5.2 tall, booster ~7.2 (public ratio order)
  const D = 0.9
  const shipH = 5.2
  const boostH = 7.15
  const shipY = boosterOnly ? 0 : shipOnly ? 0 : boostH / 2 + shipH / 2
  const boostY = 0

  return (
    <group scale={scale}>
      {!boosterOnly && (
        <group position={[0, shipY, 0]}>
          {/* Forward flaps */}
          <Flap side={1} y={shipH * 0.28} forward material={dark} />
          <Flap side={-1} y={shipH * 0.28} forward material={dark} />
          {/* Aft flaps */}
          <Flap side={1} y={-shipH * 0.28} material={dark} />
          <Flap side={-1} y={-shipH * 0.28} material={dark} />

          {/* Nose ogive */}
          <mesh position={[0, shipH * 0.42, 0]} material={steel}>
            <cylinderGeometry args={[D * 0.08, D * 0.5, shipH * 0.22, 32]} />
          </mesh>
          <mesh position={[0, shipH * 0.55, 0]} material={steel}>
            <sphereGeometry args={[D * 0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>

          {/* Main barrel */}
          <mesh material={steel}>
            <cylinderGeometry args={[D * 0.5, D * 0.5, shipH * 0.72, 36]} />
          </mesh>

          {/* Windward heat-shield tiles (half-cylinder) */}
          <mesh rotation={[0, Math.PI / 2, 0]} material={tile}>
            <cylinderGeometry
              args={[D * 0.505, D * 0.505, shipH * 0.7, 36, 1, false, -Math.PI * 0.55, Math.PI * 1.1]}
            />
          </mesh>

          {/* Weld ring cues */}
          {[-0.15, 0.1, 0.32].map((yy) => (
            <mesh key={yy} position={[0, yy * shipH, 0]} material={steelDark}>
              <torusGeometry args={[D * 0.502, 0.012, 6, 40]} />
            </mesh>
          ))}

          {/* Engine section */}
          <mesh position={[0, -shipH * 0.4, 0]} material={steelDark}>
            <cylinderGeometry args={[D * 0.48, D * 0.52, shipH * 0.08, 28]} />
          </mesh>

          {/* 3 sea-level + 3 vacuum-ish bells (readable cluster) */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2
            return (
              <mesh
                key={`sl-${i}`}
                position={[Math.cos(a) * 0.18, -shipH * 0.48, Math.sin(a) * 0.18]}
                material={nozzle}
              >
                <cylinderGeometry args={[0.05, 0.1, 0.28, 12]} />
              </mesh>
            )
          })}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5
            return (
              <mesh
                key={`vac-${i}`}
                position={[Math.cos(a) * 0.32, -shipH * 0.5, Math.sin(a) * 0.32]}
                material={nozzleVac}
              >
                <cylinderGeometry args={[0.06, 0.14, 0.38, 14]} />
              </mesh>
            )
          })}

          <group position={[0, -shipH * 0.52, 0]}>
            <ExhaustPlume intensity={plume} />
          </group>
        </group>
      )}

      {(!shipOnly || boosterOnly) && (
        <group position={[0, boostY, 0]}>
          <mesh position={[0, 0, 0]} material={steel}>
            <cylinderGeometry args={[D * 0.5, D * 0.52, boostH * 0.9, 36]} />
          </mesh>
          {/* Chinese-ring style banding cue */}
          {[-0.25, 0, 0.25].map((yy) => (
            <mesh key={yy} position={[0, yy * boostH, 0]} material={steelDark}>
              <torusGeometry args={[D * 0.515, 0.014, 6, 40]} />
            </mesh>
          ))}
          {/* Interstage */}
          <mesh position={[0, boostH * 0.48, 0]} material={steelDark}>
            <cylinderGeometry args={[D * 0.5, D * 0.5, 0.35, 28]} />
          </mesh>
          {/* Grid fins */}
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4
            return (
              <group key={i} position={[Math.cos(a) * D * 0.55, boostH * 0.32, Math.sin(a) * D * 0.55]} rotation={[0, -a, 0]}>
                <mesh material={dark}>
                  <boxGeometry args={[0.55, 0.7, 0.04]} />
                </mesh>
                {/* lattice suggestion */}
                {[-0.2, 0, 0.2].map((lx) => (
                  <mesh key={lx} position={[lx, 0, 0.02]} material={steelDark}>
                    <boxGeometry args={[0.03, 0.65, 0.02]} />
                  </mesh>
                ))}
              </group>
            )
          })}
          {/* Aft engine bay */}
          <mesh position={[0, -boostH * 0.48, 0]} material={dark}>
            <cylinderGeometry args={[D * 0.52, D * 0.56, 0.4, 28]} />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            const r = i < 4 ? 0.15 : 0.38
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * r, -boostH * 0.55, Math.sin(a) * r]}
                material={nozzle}
              >
                <cylinderGeometry args={[0.04, 0.09, 0.26, 10]} />
              </mesh>
            )
          })}
          <group position={[0, -boostH * 0.58, 0]}>
            <ExhaustPlume intensity={plume} heavy />
          </group>
        </group>
      )}
    </group>
  )
}

function Flap({
  side,
  y,
  forward,
  material,
}: {
  side: number
  y: number
  forward?: boolean
  material: THREE.Material
}) {
  const w = forward ? 0.42 : 0.7
  const h = forward ? 0.9 : 1.15
  return (
    <mesh
      position={[side * 0.55, y, 0]}
      rotation={[0.15, 0, side * (forward ? 0.55 : 0.35)]}
      material={material}
    >
      <boxGeometry args={[w, h, 0.05]} />
    </mesh>
  )
}
