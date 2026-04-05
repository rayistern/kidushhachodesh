import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#ff6666', background: '#111', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1>Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.7 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load AppShell so we can catch import errors too
const AppShell = React.lazy(() => import('./components/layout/AppShell'));

export default function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={
        <div style={{ padding: 40, color: '#4ea1f7', background: '#0a0e14', minHeight: '100vh', fontFamily: 'monospace' }}>
          Loading Kiddush HaChodesh Dashboard...
        </div>
      }>
        <AppShell />
      </React.Suspense>
    </ErrorBoundary>
  );
}
