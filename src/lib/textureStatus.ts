/** Tiny bus so the canvas shell can show a non-blank “textures loading…” chip. */

type Status = { inFlight: number; failed: boolean; loading: boolean }
type Listener = (s: Status) => void

let inFlight = 0
let failed = false
const listeners = new Set<Listener>()

function emit() {
  const status: Status = { inFlight, failed, loading: inFlight > 0 }
  listeners.forEach((l) => l(status))
}

/** Call when a texture upgrade starts. */
export function beginTextureUpgrade() {
  inFlight += 1
  emit()
}

/** Call when a texture upgrade ends (ok or fail). */
export function endTextureUpgrade(didFail: boolean) {
  inFlight = Math.max(0, inFlight - 1)
  if (didFail) failed = true
  if (inFlight === 0 && !didFail && !failed) failed = false
  if (inFlight === 0 && !didFail) {
    // All done successfully — clear failed latch
    // (keep failed=true if any failed this wave)
  }
  emit()
  if (inFlight === 0) {
    // Reset failed latch shortly after wave completes so chip can dismiss
    window.setTimeout(() => {
      if (inFlight === 0) {
        failed = false
        emit()
      }
    }, 4000)
  }
}

/** @deprecated prefer begin/end — kept for simple set patches */
export function setTextureStatus(next: { loading?: boolean; failed?: boolean }) {
  if (next.loading === true) beginTextureUpgrade()
  if (next.loading === false) endTextureUpgrade(!!next.failed)
}

export function getTextureStatus() {
  return { inFlight, failed, loading: inFlight > 0 }
}

export function subscribeTextureStatus(listener: Listener) {
  listeners.add(listener)
  listener(getTextureStatus())
  return () => {
    listeners.delete(listener)
  }
}
