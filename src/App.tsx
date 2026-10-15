import { Suspense, useEffect } from 'react'
import { Controls } from './components/Controls'
import { DestinationPanel } from './components/DestinationPanel'
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
          onLocale={setLocale}
          onDifficulty={setDifficulty}
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
              <MissionScene progress={progress} destinationId={destinationId} />
            </Suspense>
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
          <VehiclePanel locale={locale} />
        </div>
      </main>

      <footer className="footer">
        <p>{t(locale, 'disclaimer')}</p>
      </footer>
    </div>
  )
}
