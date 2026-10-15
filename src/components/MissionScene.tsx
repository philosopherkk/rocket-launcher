import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { StarshipModel } from './StarshipModel'
import type { DestinationId } from '../data/destinations'
import { HELIO_BODY_EXAGGERATION, type ScaleMode } from '../data/astroConstants'
import {
  bodyRadiusScene,
  isCislunar,
  samplePath,
  targetHelioAu,
  transferCurvePoints,
} from '../lib/transferGeometry'
import { craftKmAt, leoPathKm, transferPathKm } from '../lib/craftKm'
import {
  autoDistanceKm,
  EARTH_R_KM,
  kmToLogDist,
  logDistToKm,
  MOON_DIST_KM,
  MOON_R_KM,
  SHIP_MODEL_TO_KM,
  showDetailedShip,
} from '../lib/kmCamera'
import {
  makeCloudTexture,
  makeEarthTexture,
  makeMoonTexture,
  makePlanetTexture,
} from '../lib/textures'
import { vehiclePose } from '../lib/vehiclePath'
import { zoomDistanceFactor } from './ViewerBar'

export type CameraOrbit = { yaw: number; pitch: number }

type Props = {
  progress: number
  destinationId: DestinationId
  scaleMode: ScaleMode
  /** log10(stand-off km) for true-scale cislunar; also used as relative zoom for helio */
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}

const _up = new THREE.Vector3(0, 1, 0)
const _lookMat = new THREE.Matrix4()
const _lookQ = new THREE.Quaternion()

function SunLight() {
  return (
    <>
      <directionalLight position={[800_000, 420_000, 280_000]} intensity={2.8} color="#fff1dd" />
      <directionalLight position={[-200_000, 100_000, -400_000]} intensity={0.35} color="#8eb4ff" />
      <hemisphereLight args={['#a8c4ff', '#1a120c', 0.45]} />
      <ambientLight intensity={0.18} />
    </>
  )
}

function HelioSunLight() {
  return (
    <>
      <directionalLight position={[40, 28, 18]} intensity={2.2} color="#fff1dd" />
      <hemisphereLight args={['#a8c4ff', '#1a120c', 0.32]} />
      <ambientLight intensity={0.07} />
    </>
  )
}

function craftKm(progress: number, destinationId: DestinationId): {
  position: THREE.Vector3
  tangent: THREE.Vector3
  altitudeKm: number | null
} {
  if (isCislunar(destinationId)) {
    const c = craftKmAt(progress)
    return { position: c.position, tangent: c.tangent, altitudeKm: c.altitudeKm }
  }
  const s = samplePath(progress, destinationId)
  return { position: s.position.clone(), tangent: s.tangent.clone(), altitudeKm: null }
}

function TrueEarth({ cameraKm }: { cameraKm: number }) {
  const map = useMemo(() => makeEarthTexture(768), [])
  const clouds = useMemo(() => makeCloudTexture(512), [])
  const g = useRef<THREE.Group>(null)
  const far = cameraKm > 25_000
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.012
  })
  return (
    <group>
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[EARTH_R_KM, 72, 72]} />
          <meshStandardMaterial
            map={map}
            roughness={0.78}
            metalness={0.04}
            emissive="#1a4060"
            emissiveIntensity={far ? 0.55 : 0.28}
          />
        </mesh>
        {!far && (
          <mesh>
            <sphereGeometry args={[EARTH_R_KM * 1.012, 48, 48]} />
            <meshStandardMaterial
              map={clouds}
              transparent
              opacity={0.2}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
        )}
      </group>
      <mesh>
        <sphereGeometry args={[EARTH_R_KM * 1.03, 40, 40]} />
        <meshBasicMaterial
          color="#8ec8ff"
          transparent
          opacity={far ? 0.35 : 0.16}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Unlit core so software GL still shows a marble at cislunar range */}
      {far && (
        <mesh>
          <sphereGeometry args={[EARTH_R_KM * 1.02, 32, 32]} />
          <meshBasicMaterial color="#3d8fd4" />
        </mesh>
      )}
      {far && (
        <mesh>
          <sphereGeometry args={[EARTH_R_KM * 6, 24, 24]} />
          <meshBasicMaterial color="#5eb0ff" transparent opacity={0.14} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

/** Compact pad apron (~40 m) — readable next to a 120 m stack, not a continent-sized slab. */
function PadApron({ normal }: { normal: THREE.Vector3 }) {
  const n = normal.clone().normalize()
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)
  const pos = n.multiplyScalar(EARTH_R_KM + 0.008)
  return (
    <group position={pos} quaternion={q}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 48]} />
        <meshStandardMaterial color="#5a6570" roughness={0.92} metalness={0.18} />
      </mesh>
      <mesh position={[0.02, 0.015, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.012, 0.03, 0.012]} />
        <meshStandardMaterial color="#7a8490" roughness={0.8} metalness={0.25} />
      </mesh>
    </group>
  )
}

function TrueMoon({ cameraKm }: { cameraKm: number }) {
  const map = useMemo(() => makeMoonTexture(640), [])
  const far = cameraKm > 25_000
  return (
    <group position={[MOON_DIST_KM, 0, 0]}>
      <mesh>
        <sphereGeometry args={[MOON_R_KM, 56, 56]} />
        <meshStandardMaterial
          map={map}
          roughness={0.96}
          metalness={0.02}
          emissive="#2a2a2a"
          emissiveIntensity={far ? 0.4 : 0.2}
        />
      </mesh>
      {far && (
        <mesh>
          <sphereGeometry args={[MOON_R_KM * 1.05, 28, 28]} />
          <meshBasicMaterial color="#c8c2b8" />
        </mesh>
      )}
      {far && (
        <mesh>
          <sphereGeometry args={[MOON_R_KM * 7, 18, 18]} />
          <meshBasicMaterial color="#d8d0c4" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
      <Html distanceFactor={40_000} style={{ pointerEvents: 'none' }}>
        <div className="body-label">Moon</div>
      </Html>
    </group>
  )
}

function CraftAtTrueScale({
  progress,
  destinationId,
  cameraKm,
}: {
  progress: number
  destinationId: DestinationId
  cameraKm: number
}) {
  const ref = useRef<THREE.Group>(null)
  const detailed = showDetailedShip(cameraKm)
  const initial = craftKm(progress, destinationId)
  const pose = vehiclePose(progress, destinationId)
  const showPad = detailed && progress < 0.12

  useFrame((_, dt) => {
    if (!ref.current) return
    const c = craftKm(progress, destinationId)
    const err = ref.current.position.distanceTo(c.position)
    const k = err > 200 ? 1 : 1 - Math.exp(-dt * 10)
    ref.current.position.lerp(c.position, k)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.tangent)
    ref.current.quaternion.slerp(q, k)
  })

  return (
    <>
      {showPad && <PadApron normal={initial.position.clone().normalize()} />}
      <group ref={ref} position={initial.position}>
        {detailed ? (
          <StarshipModel
            shipOnly={pose.shipOnly || !!pose.booster}
            plume={pose.plume}
            scale={SHIP_MODEL_TO_KM}
          />
        ) : (
          <mesh>
            <sphereGeometry args={[Math.max(12, cameraKm * 0.00055), 12, 12]} />
            <meshBasicMaterial color="#3dd6c6" />
          </mesh>
        )}
      </group>
    </>
  )
}

/**
 * Orbit camera for the true-km cislunar scene.
 * Close: local ENU around the craft (horizon-level up = radial).
 * Wide: spherical orbit about the Earth–Moon midpoint so both bodies stay in FOV.
 */
function CislunarCamera({
  progress,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const smoothLog = useRef(logDist)
  const smoothYaw = useRef(orbit.yaw)
  const smoothPitch = useRef(orbit.pitch)
  const booted = useRef(false)

  useFrame((_, dt) => {
    const craft = craftKm(progress, destinationId)
    const distTarget = userCamera ? logDistToKm(logDist) : autoDistanceKm(progress)
    const logTarget = userCamera ? logDist : kmToLogDist(distTarget)
    const blend = 1 - Math.exp(-dt * (userCamera ? 12 : 3.2))
    smoothLog.current += (logTarget - smoothLog.current) * blend
    smoothYaw.current += (orbit.yaw - smoothYaw.current) * (userCamera ? blend : blend * 0.65)
    smoothPitch.current += (orbit.pitch - smoothPitch.current) * (userCamera ? blend : blend * 0.65)

    const dist = logDistToKm(smoothLog.current)
    onCameraKm?.(dist)

    const pitch = THREE.MathUtils.clamp(smoothPitch.current, -0.15, 1.25)
    const yaw = smoothYaw.current
    let focus = new THREE.Vector3()
    let desired = new THREE.Vector3()
    let up = _up

    // Min stand-off to fit Earth+Moon in ~56° FOV about the midpoint: (MD/2)/tan(28°) ≈ 3.6e5 km
    const CISLUNAR_FIT_KM = 360_000
    const cp = Math.cos(pitch)
    const sp = Math.sin(pitch)
    const sy = Math.sin(yaw)
    const cy = Math.cos(yaw)

    if (dist < 100) {
      // Local horizon frame — stand off beside/above craft, never underground
      const radial = craft.position.clone().normalize()
      const east = new THREE.Vector3().crossVectors(_up, radial)
      if (east.lengthSq() < 1e-8) east.set(1, 0, 0)
      else east.normalize()
      const north = new THREE.Vector3().crossVectors(radial, east).normalize()
      // Raised side vantage: stack against sky with honest Earth curvature below
      const lift = Math.max(dist * 0.72, 0.5)
      const along = dist * 0.78
      desired
        .copy(craft.position)
        .addScaledVector(east, sy * cp * along)
        .addScaledVector(north, cy * cp * along)
        .addScaledVector(radial, lift + Math.max(0, sp) * dist * 0.4)
      const minR = EARTH_R_KM + Math.max(0.65, dist * 0.55)
      if (desired.length() < minR) {
        const horiz = new THREE.Vector3()
          .addScaledVector(east, sy * along)
          .addScaledVector(north, cy * along)
        desired.copy(radial).multiplyScalar(minR).add(horiz)
      }
      focus
        .copy(craft.position)
        .addScaledVector(radial, 0.05)
        .addScaledVector(east, -sy * cp * dist * 0.2)
        .addScaledVector(north, -cy * cp * dist * 0.2)
      up = radial
    } else if (dist >= CISLUNAR_FIT_KM) {
      // Wide enough: orbit the Earth–Moon midpoint so both bodies stay in frame
      focus.set(MOON_DIST_KM * 0.5, 0, 0)
      const widePitch = pitch * 0.5
      const wcp = Math.cos(widePitch)
      const wsp = Math.sin(widePitch)
      desired.set(
        focus.x + sy * wcp * dist,
        focus.y + Math.max(0.12, wsp) * dist,
        focus.z + cy * wcp * dist,
      )
      up = _up
    } else {
      // Ascent / LEO / transfer — orbit the craft (or Earth when far from vehicle)
      focus.copy(craft.position)
      if (dist > 20_000) {
        // Pull focus toward Earth so the planet fills the frame during coast
        const w = Math.min(1, (dist - 20_000) / 80_000)
        focus.lerp(new THREE.Vector3(0, 0, 0), w * 0.75)
      }
      desired.set(
        focus.x + sy * cp * dist,
        focus.y + sp * dist,
        focus.z + cy * cp * dist,
      )
      const minR = EARTH_R_KM + Math.max(2, dist * 0.04)
      if (desired.length() < minR) desired.normalize().multiplyScalar(minR)
      up = _up
    }

    const err = camera.position.distanceTo(desired)
    const snap = !booted.current || err > Math.max(dist * 1.5, 200)
    if (snap) {
      camera.position.copy(desired)
      look.current.copy(focus)
      booted.current = true
    } else {
      const k = 1 - Math.exp(-dt * 7)
      camera.position.lerp(desired, k)
      look.current.lerp(focus, k)
    }
    _lookMat.lookAt(camera.position, look.current, up)
    _lookQ.setFromRotationMatrix(_lookMat)
    if (snap) camera.quaternion.copy(_lookQ)
    else camera.quaternion.slerp(_lookQ, 1 - Math.exp(-dt * 8))

    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      // Widen FOV on cislunar pull-back so Earth+Moon stay inside the frustum
      if (dist < 8) persp.fov = 48
      else if (dist < 400) persp.fov = 44
      else if (dist < CISLUNAR_FIT_KM) persp.fov = 46
      else persp.fov = 56
      persp.near = dist < 3 ? 0.01 : Math.max(0.2, dist * 0.0002)
      persp.far = Math.max(4_000_000, dist * 40 + MOON_DIST_KM * 4)
      persp.updateProjectionMatrix()
    }

  })
  return null
}

function TrueScaleCislunarScene({
  progress,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const pathPts = useMemo(() => transferPathKm(120), [])
  const leoPts = useMemo(() => leoPathKm(96), [])
  const camKm = userCamera ? logDistToKm(logDist) : autoDistanceKm(progress)
  const showPaths = camKm > 80 && camKm < 900_000

  return (
    <>
      <Stars radius={2_000_000} depth={400_000} count={5000} factor={6} saturation={0} fade speed={0.1} />
      <TrueEarth cameraKm={camKm} />
      <TrueMoon cameraKm={camKm} />
      {camKm > 80_000 && (
        <Html position={[0, EARTH_R_KM * 1.8, 0]} distanceFactor={80_000} style={{ pointerEvents: 'none' }}>
          <div className="body-label">Earth</div>
        </Html>
      )}
      {showPaths && (
        <>
          <Line points={leoPts} color="#7dffb3" transparent opacity={0.4} lineWidth={1} />
          <Line points={pathPts} color="#9ad8ff" transparent opacity={0.55} lineWidth={1} />
        </>
      )}
      <CraftAtTrueScale
        progress={progress}
        destinationId={destinationId}
        cameraKm={camKm}
      />
      <CislunarCamera
        progress={progress}
        destinationId={destinationId}
        logDist={logDist}
        orbit={orbit}
        userCamera={userCamera}
        onCameraKm={onCameraKm}
      />
    </>
  )
}

/* ——— Helio (AU) path for non-Moon destinations ——— */

function ScaledBody({
  body,
  position,
  label,
}: {
  body: 'earth' | 'moon' | 'mars' | 'venus' | 'mercury' | 'jupiter'
  position: THREE.Vector3
  label?: string
}) {
  const r = bodyRadiusScene(body, 'helio')
  const map = useMemo(() => {
    if (body === 'earth') return makeEarthTexture(640)
    if (body === 'moon') return makeMoonTexture(512)
    if (body === 'mars') return makePlanetTexture('#c46a3a', '#8a3d22', 512, false, 'mars')
    if (body === 'venus') return makePlanetTexture('#e8c97a', '#c9973c', 512, true)
    if (body === 'mercury') return makePlanetTexture('#9a9590', '#6e6a66', 384, false)
    return makePlanetTexture('#d2a36b', '#b87a45', 512, true)
  }, [body])
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, 48, 48]} />
        <meshStandardMaterial map={map} roughness={0.9} metalness={0.04} />
      </mesh>
      {label && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="body-label">{label}</div>
        </Html>
      )}
    </group>
  )
}

function HelioCamera({
  progress,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  // Map logDist (−1.3…6) into AU stand-off ~0.02…8
  const auDist = useMemo(() => {
    const t = (logDist - (-1.3)) / (6 - -1.3)
    return 0.02 * Math.pow(8 / 0.02, Math.min(1, Math.max(0, t)))
  }, [logDist])

  useFrame((_, dt) => {
    const s = samplePath(progress, destinationId)
    const a2 = targetHelioAu(destinationId)
    const auto = Math.max(0.15, a2 * 0.9)
    const dist = userCamera ? auDist : auto * zoomDistanceFactor((logDist + 1.3) / 2)
    onCameraKm?.(dist * 149_597_870.7)
    const focus = s.position.clone()
    const offset = new THREE.Vector3(
      Math.cos(orbit.pitch) * Math.sin(orbit.yaw) * dist,
      Math.sin(orbit.pitch) * dist,
      Math.cos(orbit.pitch) * Math.cos(orbit.yaw) * dist,
    )
    const desired = focus.clone().add(offset)
    const k = 1 - Math.exp(-dt * 5)
    camera.position.lerp(desired, k)
    look.current.lerp(focus, k)
    _lookMat.lookAt(camera.position, look.current, _up)
    _lookQ.setFromRotationMatrix(_lookMat)
    camera.quaternion.slerp(_lookQ, k)
  })
  return null
}

function HelioScene({
  progress,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const pathPts = useMemo(() => transferCurvePoints(destinationId, 100), [destinationId])
  const a2 = targetHelioAu(destinationId)
  const marker = useRef<THREE.Group>(null)
  const destBody =
    destinationId === 'venus' ||
    destinationId === 'mercury' ||
    destinationId === 'jupiter' ||
    destinationId === 'mars'
      ? destinationId
      : 'mars'

  useFrame((_, dt) => {
    if (!marker.current) return
    const s = samplePath(progress, destinationId)
    const k = 1 - Math.exp(-dt * 10)
    marker.current.position.lerp(s.position, k)
  })

  return (
    <>
      <Stars radius={40} depth={50} count={5000} factor={2.5} saturation={0} fade speed={0.15} />
      <mesh>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshBasicMaterial color="#ffe29a" />
      </mesh>
      <ScaledBody body="earth" position={new THREE.Vector3(1, 0, 0)} label="Earth" />
      <ScaledBody body={destBody} position={new THREE.Vector3(a2, 0, 0)} label={destinationId} />
      <Line points={pathPts} color="#9ad8ff" transparent opacity={0.65} />
      <Html position={pathPts[Math.floor(pathPts.length / 2)]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div className="path-label">
          Hohmann (AU; bodies ×{HELIO_BODY_EXAGGERATION})
        </div>
      </Html>
      <group ref={marker} position={samplePath(progress, destinationId).position}>
        <mesh>
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshBasicMaterial color="#3dd6c6" />
        </mesh>
      </group>
      <HelioCamera
        progress={progress}
        destinationId={destinationId}
        logDist={logDist}
        orbit={orbit}
        userCamera={userCamera}
        onCameraKm={onCameraKm}
      />
    </>
  )
}

function SceneBody({
  progress,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: Props) {
  const cislunar = isCislunar(destinationId)

  return (
    <>
      <color attach="background" args={['#03050c']} />
      {cislunar ? (
        <>
          <SunLight />
          <TrueScaleCislunarScene
            progress={progress}
            destinationId={destinationId}
            logDist={logDist}
            orbit={orbit}
            userCamera={userCamera}
            onCameraKm={onCameraKm}
          />
        </>
      ) : (
        <>
          <fog attach="fog" args={['#03050c', 8, 60]} />
          <HelioSunLight />
          <HelioScene
            progress={progress}
            destinationId={destinationId}
            logDist={logDist}
            orbit={orbit}
            userCamera={userCamera}
            onCameraKm={onCameraKm}
          />
        </>
      )}
    </>
  )
}

export function MissionScene({
  progress,
  destinationId,
  scaleMode,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: Props) {
  const cislunar = isCislunar(destinationId)
  return (
    <Canvas
      camera={{
        position: cislunar ? [MOON_DIST_KM * 0.5, 180_000, 480_000] : [2, 1.2, 2.5],
        fov: cislunar ? 52 : 42,
        near: cislunar ? 1 : 0.01,
        far: cislunar ? 6_000_000 : 80,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        // logarithmicDepthBuffer: unreliable on SwiftShader / some headless GL stacks
        logarithmicDepthBuffer: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{ width: '100%', height: '100%', touchAction: 'none', display: 'block' }}
      onCreated={({ gl, size }) => {
        gl.domElement.style.touchAction = 'none'
        // Keep drawing buffer tied to the clamped wrap, not an unbounded layout
        if (size.height > 900) {
          console.warn('[MissionScene] unexpected canvas height', size.height)
        }
      }}
    >
      <SceneBody
        progress={progress}
        destinationId={destinationId}
        scaleMode={scaleMode}
        logDist={logDist}
        orbit={orbit}
        userCamera={userCamera}
        onCameraKm={onCameraKm}
        key={destinationId}
      />
    </Canvas>
  )
}
