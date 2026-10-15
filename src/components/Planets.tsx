import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { DestinationId } from '../data/destinations'
import { getDestination } from '../data/destinations'
import { VEHICLE_EARTH_RADIUS } from '../data/astroConstants'
import { earthPos, targetPos } from '../lib/vehiclePath'
import {
  makeCloudTexture,
  makeEarthTexture,
  makeMoonTexture,
  makePlanetTexture,
} from '../lib/textures'

export function EarthGlobe({ progress = 0 }: { progress?: number }) {
  const pos = earthPos()
  const R = VEHICLE_EARTH_RADIUS
  const map = useMemo(() => makeEarthTexture(768), [])
  const clouds = useMemo(() => makeCloudTexture(512), [])
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    if (group.current) group.current.rotation.y = progress * Math.PI * 0.12
  })

  return (
    <group position={pos}>
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[R, 72, 72]} />
          <meshStandardMaterial map={map} roughness={0.8} metalness={0.06} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R * 1.018, 48, 48]} />
          <meshStandardMaterial
            map={clouds}
            transparent
            opacity={0.26}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      </group>
      {(
        [
          { s: 1.02, c: '#7ec8ff', o: 0.1 },
          { s: 1.045, c: '#6aa8ff', o: 0.07 },
          { s: 1.08, c: '#4f8cff', o: 0.05 },
          { s: 1.12, c: '#3a6ad4', o: 0.035 },
        ] as const
      ).map((shell) => (
        <mesh key={shell.s} scale={shell.s}>
          <sphereGeometry args={[R, 40, 40]} />
          <meshBasicMaterial
            color={shell.c}
            transparent
            opacity={shell.o}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export function TargetPlanet({ destinationId }: { destinationId: DestinationId }) {
  const dest = getDestination(destinationId)
  const pos = targetPos(destinationId)
  const { radius } = dest.visual
  const group = useRef<THREE.Group>(null)

  const map = useMemo(() => {
    switch (destinationId) {
      case 'moon':
        return makeMoonTexture(512)
      case 'mars':
        return makePlanetTexture('#c46a3a', '#8a3d22', 512, false, 'mars')
      case 'venus':
        return makePlanetTexture('#e8c97a', '#d4a84a', 384, true)
      case 'mercury':
        return makePlanetTexture('#9a9590', '#6e6a66', 384, false)
      case 'jupiter':
        return makePlanetTexture('#d2a36b', '#b87a45', 384, true)
      default:
        return makeMoonTexture(256)
    }
  }, [destinationId])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * (destinationId === 'jupiter' ? 0.04 : 0.015)
  })

  return (
    <group position={pos}>
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[radius, 56, 56]} />
          <meshStandardMaterial map={map} roughness={0.92} metalness={0.04} />
        </mesh>
      </group>
      {(destinationId === 'mars' || destinationId === 'venus') && (
        <mesh scale={1.06}>
          <sphereGeometry args={[radius, 40, 40]} />
          <meshBasicMaterial
            color={destinationId === 'mars' ? '#e39a6a' : '#ffe2a0'}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {destinationId === 'jupiter' && (
        <mesh rotation={[Math.PI / 2.6, 0.2, 0.1]}>
          <torusGeometry args={[radius * 1.65, 0.012, 6, 48]} />
          <meshStandardMaterial color="#c8c0b0" transparent opacity={0.06} roughness={0.95} />
        </mesh>
      )}
    </group>
  )
}
