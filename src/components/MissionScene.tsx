import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { StarshipModel } from './StarshipModel'
import { EarthGlobe, TargetPlanet } from './Planets'
import type { DestinationId } from '../data/destinations'
import {
  cameraFraming,
  earthPos,
  targetPos,
  vehiclePose,
} from '../lib/vehiclePath'

type Props = {
  progress: number
  destinationId: DestinationId
}

const _up = new THREE.Vector3(0, 1, 0)
const _lookMat = new THREE.Matrix4()
const _lookQ = new THREE.Quaternion()

function TransferPath({ destinationId }: { destinationId: DestinationId }) {
  const points = useMemo(() => {
    const earth = earthPos()
    const target = targetPos(destinationId)
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(earth.x + 8, earth.y + 13, earth.z + 3),
      new THREE.Vector3().lerpVectors(earth, target, 0.5).add(new THREE.Vector3(0, 11, 6)),
      new THREE.Vector3(target.x - 3, target.y + 2, target.z),
    )
    return curve.getPoints(80)
  }, [destinationId])

  return <Line points={points} color="#7ec8ff" transparent opacity={0.28} lineWidth={1} />
}

function SunLight() {
  const light = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    if (!light.current) return
    light.current.position.set(40, 28, 18)
    light.current.target.position.set(0, 4, 0)
    light.current.target.updateMatrixWorld()
  })
  return (
    <>
      <directionalLight ref={light} intensity={2.15} color="#fff1dd" />
      <hemisphereLight args={['#a8c4ff', '#1a120c', 0.35]} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-25, -5, -15]} intensity={0.18} color="#6a8cff" />
    </>
  )
}

function VehicleSystem({ progress, destinationId }: Props) {
  const shipRef = useRef<THREE.Group>(null)
  const boostRef = useRef<THREE.Group>(null)
  const shipVisual = useRef<THREE.Group>(null)
  const state = useRef({ shipOnly: false, plume: 0, boostPlume: 0, hasBooster: false })

  useFrame((_, dt) => {
    const target = vehiclePose(progress, destinationId)
    state.current.shipOnly = target.shipOnly || !!target.booster
    state.current.plume = target.plume
    state.current.boostPlume = target.booster?.plume ?? 0
    state.current.hasBooster = !!target.booster

    if (shipRef.current) {
      const err = shipRef.current.position.distanceTo(target.position)
      const k = err > 1.5 ? 1 : 1 - Math.exp(-dt * 12)
      shipRef.current.position.lerp(target.position, k)
      shipRef.current.quaternion.slerp(target.quaternion, k)
    }
    if (boostRef.current) {
      if (target.booster) {
        boostRef.current.visible = true
        const err = boostRef.current.position.distanceTo(target.booster.position)
        const k = err > 1.5 ? 1 : 1 - Math.exp(-dt * 11)
        boostRef.current.position.lerp(target.booster.position, k)
        boostRef.current.quaternion.slerp(target.booster.quaternion, k)
      } else {
        boostRef.current.visible = false
      }
    }

    // Toggle ship-only by swapping children visibility markers
    if (shipVisual.current) {
      shipVisual.current.userData.shipOnly = state.current.shipOnly
      shipVisual.current.userData.plume = state.current.plume
    }
  })

  const initial = vehiclePose(progress, destinationId)

  return (
    <>
      <group ref={shipRef} position={initial.position} quaternion={initial.quaternion}>
        <group ref={shipVisual}>
          <LiveShip progress={progress} destinationId={destinationId} />
        </group>
      </group>
      <group ref={boostRef} visible={false}>
        <LiveBooster progress={progress} destinationId={destinationId} />
      </group>
    </>
  )
}

function LiveShip({ progress, destinationId }: Props) {
  const pose = vehiclePose(progress, destinationId)
  return (
    <StarshipModel
      shipOnly={pose.shipOnly || !!pose.booster}
      plume={pose.plume}
      scale={0.72}
    />
  )
}

function LiveBooster({ progress, destinationId }: Props) {
  const pose = vehiclePose(progress, destinationId)
  return <StarshipModel boosterOnly plume={pose.booster?.plume ?? 0} scale={0.72} />
}

function CameraRig({ progress, destinationId }: Props) {
  const { camera } = useThree()
  const fov = useRef(42)
  const look = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const pose = vehiclePose(progress, destinationId)
    const framing = cameraFraming(progress, pose)
    const desired = pose.position.clone().add(framing.offset)
    const err = camera.position.distanceTo(desired)
    const k = err > 3 ? 1 : 1 - Math.exp(-dt * 3.2)
    camera.position.lerp(desired, k)
    look.current.lerp(framing.look, k)
    _lookMat.lookAt(camera.position, look.current, _up)
    _lookQ.setFromRotationMatrix(_lookMat)
    camera.quaternion.slerp(_lookQ, Math.min(1, k * 1.15))
    fov.current = THREE.MathUtils.lerp(fov.current, framing.fov, 1 - Math.exp(-dt * 2))
    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      persp.fov = fov.current
      persp.updateProjectionMatrix()
    }
  })
  return null
}

function SceneBody({ progress, destinationId }: Props) {
  return (
    <>
      <color attach="background" args={['#03050c']} />
      <fog attach="fog" args={['#03050c', 90, 240]} />
      <SunLight />
      <Stars radius={200} depth={80} count={6000} factor={4.2} saturation={0} fade speed={0.2} />
      <EarthGlobe />
      <TargetPlanet destinationId={destinationId} />
      <TransferPath destinationId={destinationId} />
      <VehicleSystem progress={progress} destinationId={destinationId} />
      <CameraRig progress={progress} destinationId={destinationId} />
    </>
  )
}

export function MissionScene({ progress, destinationId }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 8, 22], fov: 42, near: 0.1, far: 400 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneBody progress={progress} destinationId={destinationId} key={destinationId} />
    </Canvas>
  )
}
