import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { StarshipModel } from './StarshipModel'
import { EarthGlobe } from './Planets'
import type { DestinationId } from '../data/destinations'
import {
  LEO_ALTITUDE_KM,
  MOON_DISTANCE_EARTH_RADII,
  resolveScaleMode,
  type ScaleMode,
} from '../data/astroConstants'
import {
  bodyRadiusScene,
  isCislunar,
  leoCirclePoints,
  samplePath,
  targetHelioAu,
  transferCurvePoints,
} from '../lib/transferGeometry'
import { VEHICLE_EARTH_RADIUS } from '../data/astroConstants'
import { cameraFraming, vehiclePose } from '../lib/vehiclePath'
import {
  makeCloudTexture,
  makeEarthTexture,
  makeMoonTexture,
  makePlanetTexture,
} from '../lib/textures'
import { zoomDistanceFactor } from './ViewerBar'

type Props = {
  progress: number
  destinationId: DestinationId
  scaleMode: ScaleMode
  /** Discrete zoom step (−2…+2); positive = closer */
  zoomLevel?: number
}

const _up = new THREE.Vector3(0, 1, 0)
const _lookMat = new THREE.Matrix4()
const _lookQ = new THREE.Quaternion()

/** LEO label sits slightly outside the parking-orbit circle */
const LEO_LABEL_Y = (LEO_ALTITUDE_KM + 6371) / 6371 + 0.35

function SunLight() {
  return (
    <>
      <directionalLight position={[40, 28, 18]} intensity={2.2} color="#fff1dd" />
      <hemisphereLight args={['#a8c4ff', '#1a120c', 0.32]} />
      <ambientLight intensity={0.07} />
      <directionalLight position={[-25, -5, -15]} intensity={0.16} color="#6a8cff" />
    </>
  )
}

function ScaledBody({
  body,
  position,
  mode,
  label,
}: {
  body: 'earth' | 'moon' | 'mars' | 'venus' | 'mercury' | 'jupiter'
  position: THREE.Vector3
  mode: 'cislunar' | 'helio'
  label?: string
}) {
  const r = bodyRadiusScene(body, mode)
  const map = useMemo(() => {
    if (body === 'earth') return makeEarthTexture(768)
    if (body === 'moon') return makeMoonTexture(640)
    if (body === 'mars') return makePlanetTexture('#c46a3a', '#8a3d22', 640, false, 'mars')
    if (body === 'venus') return makePlanetTexture('#e8c97a', '#c9973c', 512, true)
    if (body === 'mercury') return makePlanetTexture('#9a9590', '#6e6a66', 448, false)
    return makePlanetTexture('#d2a36b', '#b87a45', 640, true)
  }, [body])
  const clouds = useMemo(() => (body === 'earth' ? makeCloudTexture(512) : null), [body])

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, body === 'earth' ? 72 : 56, body === 'earth' ? 72 : 56]} />
        <meshStandardMaterial
          map={map}
          roughness={body === 'earth' ? 0.78 : body === 'moon' ? 0.96 : 0.9}
          metalness={body === 'earth' ? 0.06 : 0.03}
        />
      </mesh>
      {clouds && (
        <mesh scale={1.018}>
          <sphereGeometry args={[r, 48, 48]} />
          <meshStandardMaterial
            map={clouds}
            transparent
            opacity={0.28}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}
      {body === 'earth' && (
        <mesh scale={1.04}>
          <sphereGeometry args={[r, 40, 40]} />
          <meshBasicMaterial
            color="#8ec8ff"
            transparent
            opacity={0.13}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {label && (
        <Html distanceFactor={mode === 'helio' ? 8 : 40} style={{ pointerEvents: 'none' }}>
          <div className="body-label">{label}</div>
        </Html>
      )}
    </group>
  )
}

function orbitCircle(radiusAu: number, segments = 96): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radiusAu, Math.sin(a) * radiusAu * 0.35, 0))
  }
  return pts
}

function PlanetCamera({
  progress,
  destinationId,
  lookAt,
  cislunar,
  zoomLevel,
}: {
  progress: number
  destinationId: DestinationId
  lookAt: THREE.Vector3
  cislunar: boolean
  zoomLevel: number
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const zf = zoomDistanceFactor(zoomLevel)

  useFrame((_, dt) => {
    const s = samplePath(progress, destinationId)
    let base: THREE.Vector3
    let focus = lookAt
    if (cislunar) {
      if (progress < 0.32) base = new THREE.Vector3(4, 2.5, 8)
      else if (progress < 0.72) {
        // Pull back enough to keep Earth–Moon + transfer ellipse readable
        base = new THREE.Vector3(28, 18, 48)
        focus = new THREE.Vector3(MOON_DISTANCE_EARTH_RADII * 0.45, 0, 0)
      } else base = new THREE.Vector3(10, 6, 16)
    } else {
      const a2 = targetHelioAu(destinationId)
      const span = Math.max(1.2, a2)
      base = s.position.clone().add(new THREE.Vector3(span * 0.9, span * 0.55, span * 1.1))
    }
    // Scale stand-off from focus without changing scrubber-driven path samples
    const offset = base.clone().sub(focus).multiplyScalar(zf)
    const desired = focus.clone().add(offset)
    const err = camera.position.distanceTo(desired)
    const k = err > 5 ? 1 : 1 - Math.exp(-dt * 2.5)
    camera.position.lerp(desired, k)
    look.current.lerp(focus, k)
    _lookMat.lookAt(camera.position, look.current, _up)
    _lookQ.setFromRotationMatrix(_lookMat)
    camera.quaternion.slerp(_lookQ, Math.min(1, k * 1.1))
    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      persp.fov = cislunar ? 42 : 48
      persp.near = cislunar ? 0.05 : 0.01
      persp.far = cislunar ? 500 : 80
      persp.updateProjectionMatrix()
    }
  })
  return null
}

function PlanetScaleScene({
  progress,
  destinationId,
  zoomLevel,
}: {
  progress: number
  destinationId: DestinationId
  zoomLevel: number
}) {
  const marker = useRef<THREE.Group>(null)
  const cislunar = isCislunar(destinationId)
  const pathPts = useMemo(() => transferCurvePoints(destinationId, 100), [destinationId])
  const leoPts = useMemo(() => (cislunar ? leoCirclePoints(72) : []), [cislunar])
  const sample = samplePath(progress, destinationId)
  const a2 = targetHelioAu(destinationId)
  const earthOrbit = useMemo(() => orbitCircle(1), [])
  const targetOrbit = useMemo(() => orbitCircle(a2), [a2])

  useFrame((_, dt) => {
    if (!marker.current) return
    const s = samplePath(progress, destinationId)
    const err = marker.current.position.distanceTo(s.position)
    const k = err > 2 ? 1 : 1 - Math.exp(-dt * 10)
    marker.current.position.lerp(s.position, k)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.tangent)
    marker.current.quaternion.slerp(q, k)
  })

  const destBody =
    destinationId === 'venus' ||
    destinationId === 'mercury' ||
    destinationId === 'jupiter' ||
    destinationId === 'mars'
      ? destinationId
      : 'mars'

  return (
    <>
      <Stars
        radius={cislunar ? 120 : 40}
        depth={50}
        count={5000}
        factor={cislunar ? 4 : 2.5}
        saturation={0}
        fade
        speed={0.15}
      />
      {cislunar ? (
        <>
          <ScaledBody body="earth" position={new THREE.Vector3(0, 0, 0)} mode="cislunar" label="Earth" />
          <ScaledBody
            body="moon"
            position={new THREE.Vector3(MOON_DISTANCE_EARTH_RADII, 0, 0)}
            mode="cislunar"
            label="Moon"
          />
          <Line points={leoPts} color="#7dffb3" transparent opacity={0.45} lineWidth={1} />
          <Html position={[0, LEO_LABEL_Y, 0]} distanceFactor={50} style={{ pointerEvents: 'none' }}>
            <div className="path-label">LEO ~300 km</div>
          </Html>
        </>
      ) : (
        <>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshBasicMaterial color="#ffe29a" />
          </mesh>
          <Html position={[0, 0.12, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
            <div className="path-label">Sun</div>
          </Html>
          <ScaledBody body="earth" position={new THREE.Vector3(1, 0, 0)} mode="helio" label="Earth" />
          <ScaledBody
            body={destBody}
            position={new THREE.Vector3(a2, 0, 0)}
            mode="helio"
            label={destinationId}
          />
          <Line points={earthOrbit} color="#6ec6ff" transparent opacity={0.25} />
          <Line points={targetOrbit} color="#f0a35e" transparent opacity={0.25} />
        </>
      )}
      <Line points={pathPts} color="#9ad8ff" transparent opacity={0.65} lineWidth={1.5} />
      <Html
        position={pathPts[Math.floor(pathPts.length / 2)]}
        distanceFactor={cislunar ? 55 : 6}
        style={{ pointerEvents: 'none' }}
      >
        <div className="path-label">{cislunar ? 'TLI transfer ellipse' : 'Hohmann transfer'}</div>
      </Html>

      <group ref={marker} position={sample.position}>
        {/* Marker glyph — not a giant rocket at planet scale */}
        <mesh>
          <sphereGeometry args={[cislunar ? 0.35 : 0.02, 12, 12]} />
          <meshBasicMaterial color="#3dd6c6" />
        </mesh>
        <mesh position={[0, cislunar ? 0.9 : 0.04, 0]}>
          <coneGeometry args={[cislunar ? 0.2 : 0.012, cislunar ? 0.7 : 0.04, 8]} />
          <meshBasicMaterial color="#e8eef8" />
        </mesh>
      </group>

      <PlanetCamera
        progress={progress}
        destinationId={destinationId}
        lookAt={sample.position}
        cislunar={cislunar}
        zoomLevel={zoomLevel}
      />
    </>
  )
}

/** Tiny glyph — findable but clearly ≪ Earth limb (true stack/R⊕ ≈ 2e-5). */
function EarthCraftMarker() {
  // ~0.25% of Earth radius in vehicle-mode scene units (still >> true 0.002%)
  const h = VEHICLE_EARTH_RADIUS * 0.0025
  return (
    <group>
      <mesh>
        <sphereGeometry args={[h * 0.4, 8, 8]} />
        <meshBasicMaterial color="#3dd6c6" />
      </mesh>
      <mesh position={[0, h * 0.85, 0]}>
        <coneGeometry args={[h * 0.28, h * 1.2, 6]} />
        <meshBasicMaterial color="#e8eef8" />
      </mesh>
    </group>
  )
}

function LiveShip({
  progress,
  destinationId,
  scale = 0.72,
}: {
  progress: number
  destinationId: DestinationId
  scale?: number
}) {
  const pose = vehiclePose(progress, destinationId)
  return (
    <StarshipModel shipOnly={pose.shipOnly || !!pose.booster} plume={pose.plume} scale={scale} />
  )
}

function LiveBooster({
  progress,
  destinationId,
  scale = 0.72,
}: {
  progress: number
  destinationId: DestinationId
  scale?: number
}) {
  const pose = vehiclePose(progress, destinationId)
  return <StarshipModel boosterOnly plume={pose.booster?.plume ?? 0} scale={scale} />
}

function VehicleCamera({
  progress,
  destinationId,
  zoomLevel,
}: {
  progress: number
  destinationId: DestinationId
  zoomLevel: number
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const zf = zoomDistanceFactor(zoomLevel)
  useFrame((_, dt) => {
    const pose = vehiclePose(progress, destinationId)
    const framing = cameraFraming(progress, pose)
    const offset = framing.offset.clone().multiplyScalar(zf)
    const desired = framing.look.clone().add(offset)
    const k = 1 - Math.exp(-dt * 3)
    camera.position.lerp(desired, k)
    look.current.lerp(framing.look, k)
    _lookMat.lookAt(camera.position, look.current, _up)
    _lookQ.setFromRotationMatrix(_lookMat)
    camera.quaternion.slerp(_lookQ, k)
    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      persp.fov = framing.fov
      persp.near = pose.nearEarth ? 0.2 : 0.05
      persp.far = pose.nearEarth ? 400 : 240
      persp.updateProjectionMatrix()
    }
  })
  return null
}

function VehicleScaleScene({
  progress,
  destinationId,
  zoomLevel,
}: {
  progress: number
  destinationId: DestinationId
  zoomLevel: number
}) {
  const craftRef = useRef<THREE.Group>(null)
  const boostRef = useRef<THREE.Group>(null)
  const initial = vehiclePose(progress, destinationId)
  const cueMap = useMemo(() => {
    if (destinationId === 'mars') return makePlanetTexture('#c46a3a', '#8a3d22', 384, false, 'mars')
    if (destinationId === 'moon') return makeMoonTexture(384)
    return makePlanetTexture('#b8b3a8', '#8a8680', 320, false)
  }, [destinationId])

  useFrame((_, dt) => {
    const target = vehiclePose(progress, destinationId)
    if (craftRef.current) {
      const err = craftRef.current.position.distanceTo(target.position)
      const k = err > 2 ? 1 : 1 - Math.exp(-dt * 12)
      craftRef.current.position.lerp(target.position, k)
      craftRef.current.quaternion.slerp(target.quaternion, k)
    }
    if (boostRef.current) {
      if (target.booster && !target.nearEarth) {
        boostRef.current.visible = true
        const err = boostRef.current.position.distanceTo(target.booster.position)
        const k = err > 1.5 ? 1 : 1 - Math.exp(-dt * 11)
        boostRef.current.position.lerp(target.booster.position, k)
        boostRef.current.quaternion.slerp(target.booster.quaternion, k)
      } else {
        boostRef.current.visible = false
      }
    }
  })

  const nearEarth = initial.nearEarth || vehiclePose(progress, destinationId).nearEarth

  return (
    <>
      <Stars radius={280} depth={90} count={5000} factor={4} saturation={0} fade speed={0.2} />
      <EarthGlobe />
      {/* Soft destination cue — backdrop only when leaving Earth */}
      {!nearEarth && (
        <mesh position={[22, 4, -6]}>
          <sphereGeometry args={[1.15, 40, 40]} />
          <meshStandardMaterial map={cueMap} roughness={0.95} metalness={0.02} />
        </mesh>
      )}
      <group ref={craftRef} position={initial.position} quaternion={initial.quaternion}>
        {nearEarth ? (
          <EarthCraftMarker />
        ) : (
          <LiveShip progress={progress} destinationId={destinationId} scale={0.72} />
        )}
      </group>
      <group ref={boostRef} visible={false}>
        <LiveBooster progress={progress} destinationId={destinationId} />
      </group>
      <VehicleCamera progress={progress} destinationId={destinationId} zoomLevel={zoomLevel} />
    </>
  )
}

function SceneBody({ progress, destinationId, scaleMode, zoomLevel = 0 }: Props) {
  const resolved = resolveScaleMode(scaleMode, progress)
  return (
    <>
      <color attach="background" args={['#03050c']} />
      <fog
        attach="fog"
        args={['#03050c', resolved === 'planet' ? 200 : 40, resolved === 'planet' ? 600 : 220]}
      />
      <SunLight />
      {resolved === 'planet' ? (
        <PlanetScaleScene
          progress={progress}
          destinationId={destinationId}
          zoomLevel={zoomLevel}
        />
      ) : (
        <VehicleScaleScene
          progress={progress}
          destinationId={destinationId}
          zoomLevel={zoomLevel}
        />
      )}
    </>
  )
}

export function MissionScene({ progress, destinationId, scaleMode, zoomLevel = 0 }: Props) {
  const resolved = resolveScaleMode(scaleMode, progress)
  return (
    <Canvas
      camera={{
        position: resolved === 'planet' ? [8, 5, 14] : [0, 8, 22],
        fov: 42,
        near: 0.05,
        far: 800,
      }}
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
      <SceneBody
        progress={progress}
        destinationId={destinationId}
        scaleMode={scaleMode}
        zoomLevel={zoomLevel}
        key={`${destinationId}-${resolved}`}
      />
    </Canvas>
  )
}
