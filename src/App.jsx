import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

// Lazy load heavy views so route-based code splitting works.
const AppShell = React.lazy(() => import('./components/layout/AppShell'));
const CompareView = React.lazy(() => import('./components/compare/CompareView'));

const Fallback = () => (
  <div style={{ padding: 40, color: '#4ea1f7', background: '#0a0e14', minHeight: '100vh', fontFamily: 'monospace' }}>
    Loading Kiddush HaChodesh Dashboard...
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<AppShell initialPreset="home" />} />
          <Route path="/explore" element={<AppShell initialPreset="explore" />} />
          <Route path="/calculate" element={<AppShell initialPreset="calculate" />} />
          <Route path="/calculate/:date" element={<AppShell initialPreset="calculate" />} />
          <Route path="/learn" element={<AppShell initialPreset="learn" />} />
          <Route path="/learn/:chapter" element={<AppShell initialPreset="learn" />} />
          <Route path="/compare" element={<CompareView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}
