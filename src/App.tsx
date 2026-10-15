import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AtmospherePanel } from './components/AtmospherePanel'
import { Controls } from './components/Controls'
import { DestinationPanel } from './components/DestinationPanel'
import { MeasurementHud } from './components/MeasurementHud'
import { MissionScene } from './components/MissionScene'
import { PhasePanel } from './components/PhasePanel'
import { Timeline } from './components/Timeline'
import { VehicleInset } from './components/VehicleInset'
import { VehiclePanel } from './components/VehiclePanel'
import { clampZoom, ViewerBar, ZOOM_STEP } from './components/ViewerBar'
import { resolveScaleMode } from './data/astroConstants'
import { t } from './data/i18n'
import { useMissionState } from './hooks/useMissionState'
import { vehiclePose } from './lib/vehiclePath'

export default function App() {
  const {
    locale,
    setLocale,
    difficulty,
    setDifficulty,
    destinationId,
    setDestinationId,
    scaleMode,
    setScaleMode,
    progress,
    setProgress,
    playing,
    togglePlay,
    phase,
    phaseIndex,
  } = useMissionState()

  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [zoomLevel, setZoomLevel] = useState(0)

  const setStage = useCallback((node: HTMLDivElement | null) => {
    stageRef.current = node
    setStageEl(node)
  }, [])

  const zoomIn = useCallback(
    () => setZoomLevel((z) => clampZoom(z + ZOOM_STEP)),
    [],
  )
  const zoomOut = useCallback(
    () => setZoomLevel((z) => clampZoom(z - ZOOM_STEP)),
    [],
  )
  const zoomReset = useCallback(() => setZoomLevel(0), [])

  // Smooth scroll / trackpad zoom on the 3D canvas (not on HUD controls)
  useEffect(() => {
    const el = stageEl
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.viewer-bar, .measure-hud, .vehicle-inset, button, select, input')) {
        return
      }
      e.preventDefault()
      // deltaY > 0 → zoom out (increase stand-off)
      const sensitivity = e.deltaMode === 1 ? 0.12 : 0.0018
      setZoomLevel((z) => clampZoom(z - e.deltaY * sensitivity))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [stageEl])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-Hant' ? 'zh-Hant' : 'en'
  }, [locale])

  const resolvedScale = resolveScaleMode(scaleMode, progress)
  const pose = useMemo(() => vehiclePose(progress, destinationId), [progress, destinationId])
  const showInset = resolvedScale === 'vehicle' && pose.nearEarth

  return (
    <div className="app" data-locale={locale}>
      <header className="hero-bar">
        <div className="brand-block">
          <p className="brand">{t(locale, 'brand')}</p>
          <p className="tagline">{t(locale, 'tagline')}</p>
        </div>
        <Controls
          locale={locale}
          difficulty={difficulty}
          scaleMode={scaleMode}
          onLocale={setLocale}
          onDifficulty={setDifficulty}
          onScaleMode={setScaleMode}
        />
      </header>

      <DestinationPanel
        locale={locale}
        difficulty={difficulty}
        destinationId={destinationId}
        onDestination={setDestinationId}
      />

      <p className="compare-hint">{t(locale, 'compareHint')}</p>

      <main className="layout">
        <div className="stage">
          <div className="canvas-wrap" ref={setStage}>
            <Suspense fallback={<div className="canvas-fallback">Loading 3D…</div>}>
              <MissionScene
                progress={progress}
                destinationId={destinationId}
                scaleMode={scaleMode}
                zoomLevel={zoomLevel}
              />
            </Suspense>
            <ViewerBar
              locale={locale}
              playing={playing}
              zoomLevel={zoomLevel}
              fullscreenTarget={stageEl}
              onTogglePlay={togglePlay}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onZoomReset={zoomReset}
            />
            <VehicleInset
              locale={locale}
              shipOnly={pose.shipOnly || !!pose.booster}
              plume={pose.plume}
              visible={showInset}
            />
            <MeasurementHud
              locale={locale}
              difficulty={difficulty}
              destinationId={destinationId}
              progress={progress}
              scaleMode={scaleMode}
            />
          </div>
          <Timeline
            locale={locale}
            progress={progress}
            playing={playing}
            phaseIndex={phaseIndex}
            onProgress={setProgress}
            onTogglePlay={togglePlay}
          />
        </div>

        <div className="side">
          <PhasePanel
            locale={locale}
            difficulty={difficulty}
            phase={phase}
            phaseIndex={phaseIndex}
            destinationId={destinationId}
          />
          <AtmospherePanel
            locale={locale}
            difficulty={difficulty}
            destinationId={destinationId}
            phaseId={phase.id}
          />
          <VehiclePanel locale={locale} />
        </div>
      </main>

      <footer className="footer">
        <p>{t(locale, 'disclaimer')}</p>
      </footer>
    </div>
  )
}
