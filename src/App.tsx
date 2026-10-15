import { Suspense, useEffect } from 'react'
import { AtmospherePanel } from './components/AtmospherePanel'
import { Controls } from './components/Controls'
import { DestinationPanel } from './components/DestinationPanel'
import { MeasurementHud } from './components/MeasurementHud'
import { MissionScene } from './components/MissionScene'
import { PhasePanel } from './components/PhasePanel'
import { Timeline } from './components/Timeline'
import { VehiclePanel } from './components/VehiclePanel'
import { t } from './data/i18n'
import { useMissionState } from './hooks/useMissionState'

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

      <p className="compare-hint">{t(locale, 'compareHint')}</p>

      <main className="layout">
        <div className="stage">
          <div className="canvas-wrap">
            <Suspense fallback={<div className="canvas-fallback">Loading 3D…</div>}>
              <MissionScene
                progress={progress}
                destinationId={destinationId}
                scaleMode={scaleMode}
              />
            </Suspense>
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
