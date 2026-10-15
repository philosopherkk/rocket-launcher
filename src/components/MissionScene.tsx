import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { StarshipModel } from './StarshipModel'
import { phaseAtProgress } from '../data/phases'
import { getDestination, type DestinationId } from '../data/destinations'

type Props = {
  progress: number
  destinationId: DestinationId
}

function earthPos(): THREE.Vector3 {
  return new THREE.Vector3(-18, 0, 0)
}

function targetPos(destinationId: DestinationId): THREE.Vector3 {
  const d = getDestination(destinationId).visual.distanceScale
  // Educational layout (not AU-accurate): farther planets sit farther along +X
  return new THREE.Vector3(14 + d * 10, 3 + d * 1.2, -4 - d * 1.5)
}

/** Map scrubber progress to educational path positions (not orbital-scale accurate). */
function vehiclePose(progress: number, destinationId: DestinationId) {
  const earth = earthPos()
  const target = targetPos(destinationId)
  const mid = new THREE.Vector3().lerpVectors(earth, target, 0.5).add(new THREE.Vector3(0, 8, 4))
  const landClearance = getDestination(destinationId).visual.radius + 1.0

  const p = Math.min(1, Math.max(0, progress))
  const phase = phaseAtProgress(p)
  let shipOnly = p >= 0.22
  let enginesLit = false
  let position = new THREE.Vector3()
  let lookAhead = new THREE.Vector3()

  if (p < 0.08) {
    position.set(earth.x + 2.2, earth.y + 2.35, earth.z)
    lookAhead.copy(position).add(new THREE.Vector3(0, 1, 0))
    shipOnly = false
    enginesLit = false
  } else if (p < 0.2) {
    const t = (p - 0.08) / 0.12
    position.set(earth.x + 2.2 + t * 1.5, earth.y + 2.35 + t * 10, earth.z + t * 2)
    lookAhead.copy(position).add(new THREE.Vector3(0.2, 1, 0.1))
    shipOnly = false
    enginesLit = true
  } else if (p < 0.32) {
    const t = (p - 0.2) / 0.12
    position.set(earth.x + 4 + t * 4, earth.y + 12 + Math.sin(t * Math.PI) * 2, earth.z + 3)
    lookAhead.copy(position).add(new THREE.Vector3(1, 0.2, 0))
    shipOnly = t > 0.15
    enginesLit = true
  } else if (p < 0.48) {
    const t = (p - 0.32) / 0.16
    position.lerpVectors(new THREE.Vector3(earth.x + 8, earth.y + 12, earth.z + 3), mid, t)
    lookAhead.lerpVectors(mid, target, t)
    shipOnly = true
    enginesLit = t < 0.15 || (t > 0.45 && t < 0.55)
  } else if (p < 0.62) {
    const t = (p - 0.48) / 0.14
    const approach = new THREE.Vector3().lerpVectors(mid, target, 0.75)
    position.lerpVectors(
      approach,
      new THREE.Vector3(target.x - landClearance, target.y + 1.2, target.z),
      t,
    )
    lookAhead.copy(target)
    shipOnly = true
    enginesLit = t > 0.35
  } else if (p < 0.72) {
    position.set(target.x - landClearance + 0.25, target.y + 1.0, target.z)
    lookAhead.copy(position).add(new THREE.Vector3(0, 1, 0))
    shipOnly = true
    enginesLit = false
  } else if (p < 0.86) {
    const t = (p - 0.72) / 0.14
    const from = new THREE.Vector3(target.x - landClearance + 0.25, target.y + 1.0, target.z)
    const to = new THREE.Vector3().lerpVectors(target, earth, 0.45).add(new THREE.Vector3(0, 6, 2))
    position.lerpVectors(from, to, t)
    lookAhead.lerpVectors(to, earth, t)
    shipOnly = true
    enginesLit = t < 0.25 || (t > 0.7 && t < 0.85)
  } else {
    const t = (p - 0.86) / 0.14
    const from = new THREE.Vector3().lerpVectors(target, earth, 0.45).add(new THREE.Vector3(0, 6, 2))
    const land = new THREE.Vector3(earth.x + 2.4, earth.y + 2.2, earth.z + 0.5)
    position.lerpVectors(from, land, t)
    lookAhead.copy(land)
    shipOnly = true
    enginesLit = t > 0.75
  }

  const quaternion = new THREE.Quaternion()
  const dir = lookAhead.clone().sub(position).normalize()
  if (dir.lengthSq() > 0.0001) {
    const tip = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    quaternion.copy(tip)
  }

  return { position, quaternion, shipOnly, enginesLit, phaseId: phase.id }
}

function Earth() {
  const pos = earthPos()
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#1f5fa8" roughness={0.75} metalness={0.12} />
      </mesh>
      <mesh rotation={[0.55, 1.1, 0.2]}>
        <sphereGeometry args={[2.015, 64, 64]} />
        <meshStandardMaterial
          color="#3a9a62"
          roughness={1}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.05, 48, 48]} />
        <meshStandardMaterial color="#8ec8ff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh position={[2.08, 0.2, 0.15]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.1, 0.18, 12]} />
        <meshStandardMaterial color="#8a9099" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function TargetBody({ destinationId }: { destinationId: DestinationId }) {
  const dest = getDestination(destinationId)
  const pos = targetPos(destinationId)
  const { color, radius } = dest.visual

  const spots = useMemo(() => {
    const arr: { p: THREE.Vector3; r: number; c: string }[] = []
    for (let i = 0; i < 14; i++) {
      const theta = Math.random() * Math.PI
      const phi = Math.random() * Math.PI * 2
      arr.push({
        p: new THREE.Vector3(
          radius * Math.sin(theta) * Math.cos(phi),
          radius * Math.cos(theta),
          radius * Math.sin(theta) * Math.sin(phi),
        ),
        r: 0.04 + Math.random() * 0.1,
        c: destinationId === 'jupiter' ? '#c4894a' : '#00000033',
      })
    }
    return arr
  }, [destinationId, radius])

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[radius, 40, 40]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.08} />
      </mesh>
      {destinationId === 'jupiter' && (
        <mesh rotation={[0.2, 0.4, 0.1]}>
          <torusGeometry args={[radius * 1.55, 0.04, 8, 48]} />
          <meshStandardMaterial color="#e6d3a8" transparent opacity={0.35} />
        </mesh>
      )}
      {spots.map((s, i) => (
        <mesh key={i} position={s.p}>
          <sphereGeometry args={[s.r, 10, 10]} />
          <meshStandardMaterial color={s.c === '#00000033' ? '#000000' : s.c} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function TransferPath({ destinationId }: { destinationId: DestinationId }) {
  const points = useMemo(() => {
    const earth = earthPos()
    const target = targetPos(destinationId)
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(earth.x + 8, earth.y + 12, earth.z + 3),
      new THREE.Vector3().lerpVectors(earth, target, 0.5).add(new THREE.Vector3(0, 10, 5)),
      new THREE.Vector3(target.x - 3, target.y + 2, target.z),
    )
    return curve.getPoints(64)
  }, [destinationId])

  return <Line points={points} color="#6ec6ff" transparent opacity={0.4} lineWidth={1} />
}

function Vehicle({ progress, destinationId }: Props) {
  const ref = useRef<THREE.Group>(null)
  const pose = vehiclePose(progress, destinationId)

  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.position.copy(pose.position)
    ref.current.quaternion.copy(pose.quaternion)
  }, [progress, destinationId, pose.position, pose.quaternion])

  return (
    <group ref={ref}>
      <StarshipModel shipOnly={pose.shipOnly} enginesLit={pose.enginesLit} scale={0.85} />
    </group>
  )
}

function CameraRig({ progress, destinationId }: Props) {
  useFrame(({ camera }) => {
    const pose = vehiclePose(progress, destinationId)
    const phase = phaseAtProgress(progress)
    let offset: THREE.Vector3
    let lookTarget = pose.position.clone()
    if (phase.id === 'prelaunch') {
      offset = new THREE.Vector3(10, 5, 14)
      lookTarget = pose.position.clone().add(new THREE.Vector3(-1.2, -0.5, 0))
    } else if (phase.id === 'ascent') {
      offset = new THREE.Vector3(8, 5, 11)
    } else if (phase.id === 'surface' || phase.id === 'lunarApproach') {
      offset = new THREE.Vector3(6, 3.5, 7)
    } else if (phase.id === 'tli' || phase.id === 'return') {
      offset = new THREE.Vector3(12, 7, 14)
    } else {
      offset = new THREE.Vector3(7, 4, 9)
    }
    camera.position.lerp(pose.position.clone().add(offset), 0.08)
    camera.lookAt(lookTarget)
  })
  return null
}

export function MissionScene({ progress, destinationId }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 45, near: 0.1, far: 500 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#050814']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[30, 20, 10]} intensity={1.4} color="#fff4e5" />
      <directionalLight position={[-20, 5, -10]} intensity={0.25} color="#8fb7ff" />
      <Stars radius={120} depth={50} count={3500} factor={3} saturation={0} fade speed={0.4} />
      <Earth />
      <TargetBody destinationId={destinationId} />
      <TransferPath destinationId={destinationId} />
      <Vehicle progress={progress} destinationId={destinationId} />
      <CameraRig progress={progress} destinationId={destinationId} />
    </Canvas>
  )
}
