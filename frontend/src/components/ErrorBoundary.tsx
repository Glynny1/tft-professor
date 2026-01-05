import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  message?: string
}

type ErrorBoundaryProps = {
  children: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unexpected error' }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="text-sm text-red-100">{this.state.message}</p>
          <button
            className="mt-4 rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

