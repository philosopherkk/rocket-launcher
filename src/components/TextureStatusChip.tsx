import { useEffect, useState } from 'react'
import { subscribeTextureStatus } from '../lib/textureStatus'

/** DOM chip over the canvas — visible even when Html labels are off-screen. */
export function TextureStatusChip() {
  const [showLoading, setShowLoading] = useState(false)
  const [showFailed, setShowFailed] = useState(false)

  useEffect(() => {
    let chipTimer: number | undefined
    return subscribeTextureStatus((s) => {
      window.clearTimeout(chipTimer)
      if (s.loading) {
        setShowFailed(false)
        chipTimer = window.setTimeout(() => setShowLoading(true), 2000)
      } else {
        setShowLoading(false)
        if (s.failed) {
          setShowFailed(true)
          chipTimer = window.setTimeout(() => setShowFailed(false), 4000)
        } else {
          setShowFailed(false)
        }
      }
    })
  }, [])

  if (!showLoading && !showFailed) return null
  return (
    <div className={`texture-status-chip${showFailed ? ' failed' : ''}`} role="status">
      {showLoading ? 'Textures loading…' : 'Using procedural maps (NASA textures unavailable)'}
    </div>
  )
}
