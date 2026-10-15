import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = { error: Error | null }

/**
 * Catch Canvas / texture / WebGL failures so React never leaves `#root` empty.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[SceneErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="canvas-fallback scene-error" role="alert">
          <p>
            3D scene failed to load ({this.state.error.message}). The rest of the lab below still
            works — try refreshing, or check that textures resolve under the site{' '}
            <code>BASE_URL</code>.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
