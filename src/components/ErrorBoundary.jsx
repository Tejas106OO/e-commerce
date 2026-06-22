import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for audit and debugging
    console.error('ErrorBoundary caught a runtime exception:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const containerStyle = {
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2xl) var(--space-xl)',
        textAlign: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }

      return (
        <div style={containerStyle}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3xl)',
            maxWidth: 480,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <AlertOctagon size={48} style={{ color: 'var(--color-error)', marginBottom: 'var(--space-lg)' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: 'var(--space-sm)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
              An unexpected application error occurred. We have captured the diagnostics to investigate. Please try reloading the homepage.
            </p>
            <button className="btn btn-primary" onClick={this.handleReset}>
              <RotateCcw size={16} /> Return to Homepage
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
