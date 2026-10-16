import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Stars } from '@react-three/drei'
import { useMemo, useRef, type RefObject } from 'react'

function isCaptureMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('capture') === '1'
  } catch {
    return false
  }
}

function liveProgress(progressRef: RefObject<number>, fallback: number): number {
  const v = progressRef.current
  return typeof v === 'number' ? v : fallback
}
import * as THREE from 'three'
import { StarshipModel } from './StarshipModel'
import type { DestinationId } from '../data/destinations'
import { HELIO_A_AU, type ScaleMode } from '../data/astroConstants'
import {
  bodyRadiusScene,
  HELIO_PLANETS,
  helioHohmannFrame,
  helioMissionPath,
  isCislunar,
  planetHelioPosition,
  planetOrbitRing,
  samplePath,
  targetHelioAu,
  transferCurvePoints,
  transferPosAtNu,
  type HelioPlanetId,
} from '../lib/transferGeometry'
import {
  craftKmAt,
  leoPathKm,
  lunarOrbitPathKm,
  missionPathKm,
  returnPathKm,
  splitPathByKind,
  transferPathKm,
} from '../lib/craftKm'
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
import { useSafeTexture, useSafeTextures } from '../hooks/useSafeTexture'
import { vehiclePose } from '../lib/vehiclePath'

export type CameraOrbit = { yaw: number; pitch: number }

type Props = {
  progress: number
  progressRef: RefObject<number>
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
      <directionalLight position={[900_000, 380_000, 220_000]} intensity={3.4} color="#fff4e5" />
      <directionalLight position={[-280_000, 80_000, -360_000]} intensity={0.22} color="#6a8ec8" />
      <hemisphereLight args={['#b7d0ff', '#1a120c', 0.28]} />
      <ambientLight intensity={0.08} />
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

function TrueEarth({ cameraKm, progress }: { cameraKm: number; progress: number }) {
  const { maps, phase, showLoadingChip } = useSafeTextures(
    ['textures/earth_day.jpg', 'textures/earth_clouds.jpg'],
    () => [makeEarthTexture(), makeCloudTexture()],
  )
  const [dayMap, cloudMap] = maps
  const g = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Group>(null)
  const far = cameraKm > 40_000
  useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace
    dayMap.anisotropy = 8
    cloudMap.colorSpace = THREE.SRGBColorSpace
    cloudMap.anisotropy = 4
  }, [dayMap, cloudMap])
  useFrame(() => {
    const spin = progress < 0.08 ? 0 : progress * Math.PI * 0.14
    if (g.current) g.current.rotation.y = spin
    if (cloudsRef.current) cloudsRef.current.rotation.y = spin * 1.04
  })
  const chip =
    showLoadingChip
      ? 'Textures loading…'
      : phase === 'failed'
        ? 'Procedural Earth map (NASA texture unavailable)'
        : null
  return (
    <group>
      {chip && (
        <Html position={[0, EARTH_R_KM * 1.35, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="texture-fallback-chip">{chip}</div>
        </Html>
      )}
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[EARTH_R_KM, 96, 96]} />
          <meshStandardMaterial
            map={dayMap}
            roughness={0.7}
            metalness={0.06}
            emissive="#061018"
            emissiveIntensity={far ? 0.18 : 0.08}
          />
        </mesh>
      </group>
      <group ref={cloudsRef}>
        <mesh>
          <sphereGeometry args={[EARTH_R_KM * 1.008, 64, 64]} />
          <meshStandardMaterial
            map={cloudMap}
            transparent
            opacity={far ? 0.28 : 0.52}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
      {/* Atmosphere limb */}
      <mesh>
        <sphereGeometry args={[EARTH_R_KM * 1.02, 48, 48]} />
        <meshBasicMaterial
          color="#7ec8ff"
          transparent
          opacity={far ? 0.18 : 0.12}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_R_KM * 1.05, 40, 40]} />
        <meshBasicMaterial
          color="#4a9de0"
          transparent
          opacity={far ? 0.12 : 0.08}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Soft findability halo (not mass) at long range */}
      {far && (
        <mesh>
          <sphereGeometry args={[EARTH_R_KM * 3.2, 24, 24]} />
          <meshBasicMaterial color="#5eb0ff" transparent opacity={0.06} depthWrite={false} />
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
  const { map, phase, showLoadingChip } = useSafeTexture('textures/moon.jpg', () =>
    makeMoonTexture(),
  )
  const far = cameraKm > 40_000
  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
  }, [map])
  const chip =
    showLoadingChip
      ? 'Textures loading…'
      : phase === 'failed'
        ? 'Procedural Moon map'
        : null
  return (
    <group position={[MOON_DIST_KM, 0, 0]}>
      {chip && (
        <Html position={[0, MOON_R_KM * 2.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="texture-fallback-chip">{chip}</div>
        </Html>
      )}
      <mesh>
        <sphereGeometry args={[MOON_R_KM, 72, 72]} />
        <meshStandardMaterial
          map={map}
          roughness={0.94}
          metalness={0.02}
          emissive="#1c1c1a"
          emissiveIntensity={far ? 0.28 : 0.08}
        />
      </mesh>
      {far && (
        <mesh>
          <sphereGeometry args={[MOON_R_KM * 5.5, 18, 18]} />
          <meshBasicMaterial color="#d0c8bc" transparent opacity={0.11} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function CraftTrail({
  craftRef,
  cameraKm,
  enabled,
}: {
  craftRef: RefObject<THREE.Group | null>
  cameraKm: number
  enabled: boolean
}) {
  const pts = useRef<THREE.Vector3[]>([])
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 3), 3))
    g.setDrawRange(0, 0)
    const m = new THREE.LineBasicMaterial({
      color: '#3dd6c6',
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
    return new THREE.Line(g, m)
  }, [])

  useFrame(() => {
    if (!enabled || !craftRef.current) {
      line.visible = false
      return
    }
    line.visible = true
    const pos = craftRef.current.position
    const trail = pts.current
    const last = trail[trail.length - 1]
    if (!last || last.distanceTo(pos) > Math.max(30, cameraKm * 0.0015)) {
      trail.push(pos.clone())
      if (trail.length > 48) trail.shift()
    }
    const geom = line.geometry
    const attr = geom.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < trail.length; i++) {
      attr.setXYZ(i, trail[i].x, trail[i].y, trail[i].z)
    }
    attr.needsUpdate = true
    geom.setDrawRange(0, trail.length)
    geom.computeBoundingSphere()
  })

  return <primitive object={line} />
}

function CraftAtTrueScale({
  progress,
  progressRef,
  destinationId,
  cameraKm,
}: {
  progress: number
  progressRef: RefObject<number>
  destinationId: DestinationId
  cameraKm: number
}) {
  const ref = useRef<THREE.Group>(null)
  const detailed = showDetailedShip(cameraKm)
  const p0 = liveProgress(progressRef, progress)
  const initial = craftKm(p0, destinationId)
  const pose = vehiclePose(p0, destinationId)
  const showPad = detailed && p0 < 0.12
  const markerR = Math.max(18, Math.min(2_400, cameraKm * 0.0045))

  useFrame((_, dt) => {
    if (!ref.current) return
    const p = liveProgress(progressRef, progress)
    const c = craftKm(p, destinationId)
    const err = ref.current.position.distanceTo(c.position)
    const k = err > 500 ? 1 : 1 - Math.exp(-dt * 14)
    ref.current.position.lerp(c.position, k)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.tangent)
    ref.current.quaternion.slerp(q, k)
  })

  return (
    <>
      {showPad && <PadApron normal={initial.position.clone().normalize()} />}
      <CraftTrail craftRef={ref} cameraKm={cameraKm} enabled={!detailed && p0 > 0.08} />
      <group ref={ref} position={initial.position}>
        {detailed ? (
          <StarshipModel
            shipOnly={pose.shipOnly || !!pose.booster}
            plume={pose.plume}
            scale={SHIP_MODEL_TO_KM}
          />
        ) : (
          <>
            <mesh>
              <sphereGeometry args={[markerR, 14, 14]} />
              <meshBasicMaterial color="#3dd6c6" />
            </mesh>
            <mesh>
              <sphereGeometry args={[markerR * 2.8, 12, 12]} />
              <meshBasicMaterial
                color="#3dd6c6"
                transparent
                opacity={0.22}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[markerR * 5.5, 10, 10]} />
              <meshBasicMaterial
                color="#7aefe4"
                transparent
                opacity={0.1}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </>
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
  progressRef,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  progressRef: RefObject<number>
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
    const p = liveProgress(progressRef, progress)
    const craft = craftKm(p, destinationId)
    const distTarget = userCamera ? logDistToKm(logDist) : autoDistanceKm(p)
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
      // Wide overview — bias look toward craft so the transfer stays readable
      const mid = new THREE.Vector3(MOON_DIST_KM * 0.5, 0, 0)
      focus.copy(craft.position).lerp(mid, 0.55)
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
      // Ascent / LEO / transfer — always track the craft (Earth may fill background)
      focus.copy(craft.position)
      if (dist > 8_000 && p < 0.52) {
        // Slight look-back toward Earth so departure context stays in frame
        const w = Math.min(0.35, (dist - 8_000) / 200_000)
        focus.lerp(new THREE.Vector3(0, 0, 0), w)
      }
      if (p >= 0.52 && p < 0.76) {
        const moon = new THREE.Vector3(MOON_DIST_KM, 0, 0)
        focus.lerp(moon, dist > 8_000 ? 0.35 : 0.55)
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
      persp.near = Math.max(1e-3, dist * 0.01)
      persp.far = Math.max(4_000_000, dist * 1e3 + MOON_DIST_KM * 2)
      persp.updateProjectionMatrix()
    }

  })
  return null
}

function TrueScaleCislunarScene({
  progress,
  progressRef,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  progressRef: RefObject<number>
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const transferPts = useMemo(() => transferPathKm(180), [])
  const returnPts = useMemo(() => returnPathKm(120), [])
  const leoPts = useMemo(() => leoPathKm(96), [])
  const lloPts = useMemo(() => lunarOrbitPathKm(96), [])
  const mission = useMemo(() => missionPathKm(320), [])
  const { powered, coast } = useMemo(
    () => splitPathByKind(mission.points, mission.kinds),
    [mission],
  )
  const camKm = userCamera ? logDistToKm(logDist) : autoDistanceKm(progress)
  const showPaths = camKm > 60 && camKm < 900_000
  const showLlo = progress >= 0.54 || camKm < 40_000
  const flownCount = Math.max(2, Math.floor(progress * (mission.points.length - 1)) + 1)
  const flownPts = useMemo(() => mission.points.slice(0, flownCount), [mission.points, flownCount])

  return (
    <>
      <Stars radius={2_000_000} depth={400_000} count={5500} factor={5} saturation={0} fade speed={0.08} />
      <TrueEarth cameraKm={camKm} progress={progress} />
      <TrueMoon cameraKm={camKm} />
      {showPaths && (
        <>
          <Line points={leoPts} color="#7dffb3" transparent opacity={0.4} lineWidth={1} />
          <Line points={transferPts} color="#5a7a9a" transparent opacity={0.45} lineWidth={1} />
          <Line points={returnPts} color="#6a5a8a" transparent opacity={0.35} lineWidth={1} />
          {showLlo && (
            <Line points={lloPts} color="#f0c35e" transparent opacity={0.75} lineWidth={2} />
          )}
          {coast.map((pts, i) =>
            pts.length >= 2 ? (
              <Line key={`c-${i}`} points={pts} color="#5a8aaa" transparent opacity={0.25} lineWidth={1} />
            ) : null,
          )}
          {powered.map((pts, i) =>
            pts.length >= 2 ? (
              <Line key={`p-${i}`} points={pts} color="#f0a35e" transparent opacity={0.55} lineWidth={2} />
            ) : null,
          )}
          {flownPts.length >= 2 && (
            <Line points={flownPts} color="#9ad8ff" transparent opacity={0.95} lineWidth={2.5} />
          )}
        </>
      )}
      <CraftAtTrueScale
        progress={progress}
        progressRef={progressRef}
        destinationId={destinationId}
        cameraKm={camKm}
      />
      <CislunarCamera
        progress={progress}
        progressRef={progressRef}
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
}: {
  body: 'earth' | 'moon' | 'mars' | 'venus' | 'mercury' | 'jupiter'
  position: THREE.Vector3
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
    </group>
  )
}

/** Segment-aware AU stand-off for one-way outbound transit. */
function autoHelioAu(progress: number, a2: number): number {
  const p = Math.min(1, Math.max(0, progress))
  const span = Math.max(a2, 1.5) * 1.7
  // Pre-depart: pull back so non-collinear planet longitudes are visible
  if (p < 0.08) return Math.max(1.6, span * 0.85)
  if (p < 0.16) return Math.max(0.9, span * 0.55)
  if (p < 0.9) {
    const u = (p - 0.16) / 0.74
    return Math.max(1.0, span * (0.55 + u * 0.28))
  }
  return Math.max(0.75, span * 0.52)
}

function HelioCamera({
  progress,
  progressRef,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  progressRef: RefObject<number>
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const booted = useRef(false)
  // Map logDist (−1.3…6) into AU stand-off ~0.02…8
  const auDist = useMemo(() => {
    const t = (logDist - -1.3) / (6 - -1.3)
    return 0.02 * Math.pow(8 / 0.02, Math.min(1, Math.max(0, t)))
  }, [logDist])

  useFrame((_, dt) => {
    const p = liveProgress(progressRef, progress)
    const s = samplePath(p, destinationId)
    const a2 = targetHelioAu(destinationId)
    const dist = userCamera ? auDist : autoHelioAu(p, a2)
    onCameraKm?.(dist * 149_597_870.7)

    // Craft-centered; slight bias to transfer midpoint during coast so scale context stays in frame
    const focus = s.position.clone()
    if (p >= 0.16 && p < 0.9) {
      const frame = helioHohmannFrame(destinationId)
      const mid = transferPosAtNu((frame.nuStart + frame.nuEnd) / 2, frame)
      focus.lerp(mid, 0.22)
    }

    const offset = new THREE.Vector3(
      Math.cos(orbit.pitch) * Math.sin(orbit.yaw) * dist,
      Math.sin(orbit.pitch) * dist,
      Math.cos(orbit.pitch) * Math.cos(orbit.yaw) * dist,
    )
    const desired = focus.clone().add(offset)
    const err = camera.position.distanceTo(desired)
    const snap = !booted.current || err > dist * 2.5
    if (snap) {
      camera.position.copy(desired)
      look.current.copy(focus)
      booted.current = true
    } else {
      const k = 1 - Math.exp(-dt * 4.5)
      camera.position.lerp(desired, k)
      look.current.lerp(focus, k)
    }
    _lookMat.lookAt(camera.position, look.current, _up)
    _lookQ.setFromRotationMatrix(_lookMat)
    if (snap) camera.quaternion.copy(_lookQ)
    else camera.quaternion.slerp(_lookQ, 1 - Math.exp(-dt * 6))

    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera) {
      persp.fov = dist > Math.max(a2, 1) * 0.7 ? 48 : 42
      persp.near = Math.max(0.001, dist * 0.002)
      persp.far = Math.max(80, dist * 40 + a2 * 8)
      persp.updateProjectionMatrix()
    }
  })
  return null
}

function HelioScene({
  progress,
  progressRef,
  destinationId,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: {
  progress: number
  progressRef: RefObject<number>
  destinationId: DestinationId
  logDist: number
  orbit: CameraOrbit
  userCamera: boolean
  onCameraKm?: (km: number) => void
}) {
  const pathPts = useMemo(() => transferCurvePoints(destinationId, 140), [destinationId])
  const mission = useMemo(() => helioMissionPath(destinationId, 220), [destinationId])
  const { powered, coast } = useMemo(
    () => splitPathByKind(mission.points, mission.kinds),
    [mission],
  )
  const a2 = targetHelioAu(destinationId)
  const marker = useRef<THREE.Group>(null)
  const sample = samplePath(progress, destinationId)
  const flownCount = Math.max(2, Math.floor(progress * (mission.points.length - 1)) + 1)
  const flownPts = useMemo(() => mission.points.slice(0, flownCount), [mission.points, flownCount])

  useFrame((_, dt) => {
    if (!marker.current) return
    const p = liveProgress(progressRef, progress)
    const s = samplePath(p, destinationId)
    const k = 1 - Math.exp(-dt * 10)
    marker.current.position.lerp(s.position, k)
  })

  return (
    <>
      <Stars radius={40} depth={50} count={5000} factor={2.5} saturation={0} fade speed={0.15} />
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshBasicMaterial color="#ffe29a" />
      </mesh>

      {/* Planets at true AU radii, J2000 mean longitudes (non-collinear); target moves on Hohmann */}
      {HELIO_PLANETS.map((id) => {
        const a = HELIO_A_AU[id]
        const ring = planetOrbitRing(a, 64)
        const pos = planetHelioPosition(id as HelioPlanetId, progress, destinationId)
        return (
          <group key={id}>
            <Line
              points={ring}
              color={id === destinationId ? '#f0a35e' : id === 'earth' ? '#5a8aaa' : '#3a4a62'}
              transparent
              opacity={id === destinationId ? 0.55 : id === 'earth' ? 0.4 : 0.28}
              lineWidth={1}
            />
            <ScaledBody body={id} position={pos} />
          </group>
        )
      })}

      {/* One-way Hohmann guide + powered/coast + flown */}
      <Line points={pathPts} color="#5a7a9a" transparent opacity={0.5} lineWidth={1} />
      {coast.map((pts, i) =>
        pts.length >= 2 ? (
          <Line key={`hc-${i}`} points={pts} color="#5a9aaa" transparent opacity={0.35} lineWidth={1} />
        ) : null,
      )}
      {powered.map((pts, i) =>
        pts.length >= 2 ? (
          <Line key={`hp-${i}`} points={pts} color="#f0a35e" transparent opacity={0.75} lineWidth={2} />
        ) : null,
      )}
      {flownPts.length >= 2 && (
        <Line points={flownPts} color="#9ad8ff" transparent opacity={0.95} lineWidth={2.5} />
      )}

      <group ref={marker} position={sample.position}>
        <mesh>
          <sphereGeometry args={[Math.max(0.015, a2 * 0.008), 10, 10]} />
          <meshBasicMaterial color="#3dd6c6" />
        </mesh>
      </group>
      <HelioCamera
        progress={progress}
        progressRef={progressRef}
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
  progressRef,
  destinationId,
  scaleMode: _scaleMode,
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
            progressRef={progressRef}
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
            progressRef={progressRef}
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
  progressRef,
  destinationId,
  scaleMode,
  logDist,
  orbit,
  userCamera,
  onCameraKm,
}: Props) {
  const cislunar = isCislunar(destinationId)
  const capture = isCaptureMode()
  return (
    <Canvas
      key={cislunar ? 'km' : 'helio'}
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
        logarithmicDepthBuffer: !capture,
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
        progressRef={progressRef}
        destinationId={destinationId}
        scaleMode={scaleMode}
        logDist={logDist}
        orbit={orbit}
        userCamera={userCamera}
        onCameraKm={onCameraKm}
      />
    </Canvas>
  )
}
