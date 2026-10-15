import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AtmospherePanel } from './components/AtmospherePanel'
import { Controls } from './components/Controls'
import { DestinationPanel } from './components/DestinationPanel'
import { MeasurementHud } from './components/MeasurementHud'
import { MissionScene, type CameraOrbit } from './components/MissionScene'
import { PhasePanel } from './components/PhasePanel'
import { Timeline } from './components/Timeline'
import { VehiclePanel } from './components/VehiclePanel'
import { ViewerBar } from './components/ViewerBar'
import {
  autoDistanceKm,
  clampLogDist,
  kmToLogDist,
  LOG_DIST_STEP,
  logDistToKm,
} from './lib/kmCamera'
import { t } from './data/i18n'
import { useMissionState } from './hooks/useMissionState'
import { isCislunar } from './lib/transferGeometry'

const DEFAULT_ORBIT: CameraOrbit = { yaw: 0.85, pitch: 0.38 }

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
    playbackRate,
    setPlaybackRate,
    cyclePlaybackRate,
    phase,
    phaseIndex,
  } = useMissionState()

  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null)
  const [logDist, setLogDist] = useState(() => kmToLogDist(autoDistanceKm(0)))
  const [orbit, setOrbit] = useState<CameraOrbit>(DEFAULT_ORBIT)
  const [userCamera, setUserCamera] = useState(false)
  const [cameraKm, setCameraKm] = useState(1)
  const dragRef = useRef<{ x: number; y: number; button: number } | null>(null)

  const setStage = useCallback((node: HTMLDivElement | null) => {
    setStageEl(node)
  }, [])

  // Auto stand-off follows mission phase until the user takes over
  useEffect(() => {
    if (userCamera) return
    setLogDist(kmToLogDist(autoDistanceKm(progress)))
  }, [progress, userCamera])

  const zoomIn = useCallback(() => {
    setUserCamera(true)
    setLogDist((z) => clampLogDist(z - LOG_DIST_STEP))
  }, [])
  const zoomOut = useCallback(() => {
    setUserCamera(true)
    setLogDist((z) => clampLogDist(z + LOG_DIST_STEP))
  }, [])
  const resetView = useCallback(() => {
    setUserCamera(false)
    setOrbit(DEFAULT_ORBIT)
    setLogDist(kmToLogDist(autoDistanceKm(progress)))
  }, [progress])

  // Wheel zoom (exponential via log10 km)
  useEffect(() => {
    const el = stageEl
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.viewer-bar, .measure-hud, button, select, input, a')) return
      e.preventDefault()
      setUserCamera(true)
      const sensitivity = e.deltaMode === 1 ? 0.08 : 0.0012
      setLogDist((z) => clampLogDist(z + e.deltaY * sensitivity))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [stageEl])

  // Orbit drag (LMB) / pan pitch-yaw with Shift or RMB
  useEffect(() => {
    const el = stageEl
    if (!el) return

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.viewer-bar, .measure-hud, button, select, input, a')) return
      if (e.button !== 0 && e.button !== 2) return
      dragRef.current = { x: e.clientX, y: e.clientY, button: e.button }
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.x
      const dy = e.clientY - dragRef.current.y
      dragRef.current = { x: e.clientX, y: e.clientY, button: dragRef.current.button }
      setUserCamera(true)
      const pan = dragRef.current.button === 2 || e.shiftKey
      setOrbit((o) => {
        const yaw = o.yaw - dx * 0.005
        const pitch = Math.min(1.2, Math.max(-0.2, o.pitch + dy * (pan ? 0.003 : 0.004)))
        return { yaw, pitch }
      })
    }
    const onUp = (e: PointerEvent) => {
      dragRef.current = null
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    const onCtx = (e: Event) => e.preventDefault()

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('contextmenu', onCtx)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('contextmenu', onCtx)
    }
  }, [stageEl])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-Hant' ? 'zh-Hant' : 'en'
  }, [locale])

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

      <p className="compare-hint">
        {t(locale, 'compareHint')}
        {isCislunar(destinationId) ? ` · ${t(locale, 'orbitHint')}` : ''}
      </p>

      <main className="layout">
        <div className="stage">
          <div className="canvas-wrap" ref={setStage}>
            <Suspense fallback={<div className="canvas-fallback">Loading 3D…</div>}>
              <MissionScene
                progress={progress}
                destinationId={destinationId}
                scaleMode={scaleMode}
                logDist={logDist}
                orbit={orbit}
                userCamera={userCamera}
                onCameraKm={setCameraKm}
              />
            </Suspense>
            <ViewerBar
              locale={locale}
              playing={playing}
              playbackRate={playbackRate}
              logDist={logDist}
              userCamera={userCamera}
              cameraKm={cameraKm || logDistToKm(logDist)}
              fullscreenTarget={stageEl}
              onTogglePlay={togglePlay}
              onCyclePlaybackRate={cyclePlaybackRate}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetView={resetView}
            />
            <MeasurementHud
              locale={locale}
              difficulty={difficulty}
              destinationId={destinationId}
              progress={progress}
              scaleMode={scaleMode}
              cameraKm={cameraKm || logDistToKm(logDist)}
            />
          </div>
          <Timeline
            locale={locale}
            progress={progress}
            playing={playing}
            playbackRate={playbackRate}
            phaseIndex={phaseIndex}
            onProgress={setProgress}
            onTogglePlay={togglePlay}
            onPlaybackRate={setPlaybackRate}
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
