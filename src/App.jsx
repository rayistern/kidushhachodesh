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
const EmbedView = React.lazy(() => import('./components/embed/EmbedView'));
const TextIndex = React.lazy(() => import('./components/text/TextIndex'));
const TextChapter = React.lazy(() => import('./components/text/TextChapter'));
const BookIndex = React.lazy(() => import('./components/book/BookIndex'));
const BookChapter = React.lazy(() => import('./components/book/BookChapter'));
const SkyPage = React.lazy(() => import('./components/sky/SkyPage'));

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
          {/* Full Rambam text — one page per chapter, KH 1-19. */}
          <Route path="/text" element={<TextIndex />} />
          <Route path="/text/:chapter" element={<TextChapter />} />
          {/* Plain-language companion — one chapter at a time, KH 14 first. */}
          <Route path="/book" element={<BookIndex />} />
          <Route path="/book/:chapter" element={<BookChapter />} />
          {/* The book's numbers drawn on the real evening sky. */}
          <Route path="/sky" element={<SkyPage />} />
          <Route path="/compare" element={<CompareView />} />
          <Route path="/embed" element={<EmbedView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}
