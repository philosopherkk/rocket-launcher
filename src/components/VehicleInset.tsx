import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { Locale } from '../data/phases'
import { STACK_HEIGHT_M, VEHICLE_DIAMETER_M } from '../data/astroConstants'
import { StarshipModel } from './StarshipModel'
import { t } from '../data/i18n'

type Props = {
  locale: Locale
  shipOnly: boolean
  plume: number
  visible: boolean
}

/** Readable Starship silhouette while main view uses a marker on Earth. */
export function VehicleInset({ locale, shipOnly, plume, visible }: Props) {
  if (!visible) return null

  return (
    <div className="vehicle-inset" aria-label={t(locale, 'vehicleInset')}>
      <div className="vehicle-inset-canvas">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [3.2, 1.2, 5.2], fov: 36, near: 0.1, far: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 6, 3]} intensity={1.6} color="#fff1dd" />
            <directionalLight position={[-3, 1, -2]} intensity={0.25} color="#6a8cff" />
            <group position={[0, shipOnly ? -0.2 : -1.1, 0]}>
              <StarshipModel shipOnly={shipOnly} plume={plume} scale={0.55} />
            </group>
          </Canvas>
        </Suspense>
      </div>
      <p className="vehicle-inset-caption">
        {t(locale, 'vehicleInset')}
        <span>
          {locale === 'en'
            ? `${STACK_HEIGHT_M} m stack · ${VEHICLE_DIAMETER_M} m Ø (public)`
            : `全箭 ${STACK_HEIGHT_M} m · 直徑 ${VEHICLE_DIAMETER_M} m（公開）`}
        </span>
      </p>
    </div>
  )
}
