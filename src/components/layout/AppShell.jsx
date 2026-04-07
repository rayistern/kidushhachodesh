import React, { useEffect, useRef } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import Scene3D from '../3d/Scene';
import EclipticRibbon from '../visualizations/EclipticRibbon';

/**
 * AppShell — three-zone layout that behaves differently on desktop vs mobile.
 *
 * Wide viewports (>= 768px): the side panels are DOCKED — they're regular
 * flex children that take up real layout space, and the 3D scene shrinks
 * to fill what's left. Closing a panel collapses its width to zero (with
 * a smooth transition) so the scene reclaims the room. No backdrop, no
 * dimming — they're not overlays.
 *
 * Narrow viewports (< 768px): the 3D scene is full-bleed and the side
 * panels become absolute drawers that overlay the scene with a dimming
 * backdrop. Only one drawer can be open at a time; dismissed by tapping
 * the backdrop or swiping off-screen.
 */
export default function AppShell() {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const compute = useCalculationStore((s) => s.compute);
  const isWideViewport = useUIStore((s) => s.isWideViewport);
  const setIsWideViewport = useUIStore((s) => s.setIsWideViewport);
  const setLeftPanelOpen = useUIStore((s) => s.setLeftPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const closeAllPanels = useUIStore((s) => s.closeAllPanels);

  // Recompute on date change
  useEffect(() => {
    compute(currentDate);
  }, [currentDate, compute]);

  // Track viewport size so the layout can switch between inline and overlay
  // drawer behavior. Panels remain closed by default regardless — the user
  // opens them from the header toggles.
  useEffect(() => {
    setIsWideViewport(window.innerWidth >= 768);
    const handler = () => setIsWideViewport(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [setIsWideViewport]);

  // Panels are docked (inline) on desktop and overlay drawers on mobile.
  // Backdrop only applies when overlays are open (i.e. on mobile).
  const anyPanelOpen = leftPanelOpen || rightPanelOpen;
  const overlayMode = !isWideViewport;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-2 sm:px-6 py-1.5 sm:py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-30 safe-top">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <PanelToggle
            onClick={toggleLeftPanel}
            active={leftPanelOpen}
            label="Values"
            aria-label="Toggle values panel"
          >
            <HamburgerIcon />
          </PanelToggle>
          <h1 className="font-bold text-[var(--color-text)] truncate">
            <span className="hebrew-text text-lg sm:text-xl">קידוש החודש</span>
          </h1>
          <span className="hidden lg:inline text-xs text-[var(--color-text-secondary)] truncate">
            Rambam's Celestial Dashboard
          </span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <NavButton icon="🔭" label="Explore" />
          <NavButton icon="🧮" label="Calculate" />
          <NavButton icon="📖" label="Learn" />
          <a
            href={`${import.meta.env.BASE_URL}ai.html`}
            className="tap-target px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium text-white bg-[var(--color-accent,#2b6cb0)] hover:opacity-90 transition-opacity flex items-center"
            title="Chat with this whole project using Claude, ChatGPT, or any AI. Build artifacts from our engine."
          >
            <span className="text-base sm:text-sm">✨</span>
            <span className="hidden sm:inline ml-1">Chat with AI</span>
          </a>
          <PanelToggle
            onClick={toggleRightPanel}
            active={rightPanelOpen}
            label="Details"
            aria-label="Toggle drill-down panel"
          >
            <PanelIcon />
          </PanelToggle>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left sidebar — date control + summary values */}
        {overlayMode ? (
          <PanelDrawer
            side="left"
            open={leftPanelOpen}
            width="w-[min(85vw,340px)]"
            onClose={() => setLeftPanelOpen(false)}
            title="Values"
          >
            <Sidebar />
          </PanelDrawer>
        ) : (
          <DockedPanel side="left" open={leftPanelOpen} width={320}>
            <Sidebar />
          </DockedPanel>
        )}

        {/* Center — ecliptic ribbon + 3D visualization stacked vertically.
            The ribbon stays fixed at the top so it's always visible while
            the 3D scene fills the rest of the column. */}
        <main className="flex-1 relative min-w-0 flex flex-col">
          <EclipticRibbon />
          <div className="flex-1 relative min-h-0">
            <Scene3D dimmed={overlayMode && anyPanelOpen} />
          </div>
        </main>

        {/* Right info panel */}
        {overlayMode ? (
          <PanelDrawer
            side="right"
            open={rightPanelOpen}
            width="w-[min(90vw,380px)]"
            onClose={() => setRightPanelOpen(false)}
            title="Drill-Down"
          >
            <InfoPanel />
          </PanelDrawer>
        ) : (
          <DockedPanel side="right" open={rightPanelOpen} width={400}>
            <InfoPanel />
          </DockedPanel>
        )}

        {/* Backdrop only when an overlay drawer is open (mobile) */}
        {overlayMode && anyPanelOpen && (
          <div
            onClick={closeAllPanels}
            className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px]"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

/**
 * DockedPanel — desktop-only inline panel that takes real layout space.
 * The outer wrapper animates its width between 0 and the target width;
 * the inner div holds a fixed-width content frame so the children don't
 * reflow as the wrapper collapses.
 */
function DockedPanel({ side, open, width, children }) {
  const borderClass =
    side === 'left'
      ? 'border-r border-[var(--color-border)]'
      : 'border-l border-[var(--color-border)]';
  return (
    <aside
      className={`flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out bg-[var(--color-surface)] ${borderClass}`}
      style={{ width: open ? width : 0 }}
    >
      <div style={{ width }} className="h-full">
        {children}
      </div>
    </aside>
  );
}

/**
 * PanelDrawer — always an overlay drawer that slides in from the given
 * side. Supports swipe-to-dismiss in the off-screen direction.
 */
function PanelDrawer({ side, open, width, children, onClose, title }) {
  const startX = useRef(null);
  const deltaX = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const handleTouchMove = (e) => {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dismissDx = side === 'left' ? Math.min(0, dx) : Math.max(0, dx);
    deltaX.current = dismissDx;
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${dismissDx}px)`;
      containerRef.current.style.transition = 'none';
    }
  };
  const handleTouchEnd = () => {
    if (startX.current == null) return;
    if (containerRef.current) {
      containerRef.current.style.transition = '';
      containerRef.current.style.transform = '';
    }
    if (Math.abs(deltaX.current) > 60) onClose && onClose();
    startX.current = null;
    deltaX.current = 0;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`absolute top-0 ${side}-0 h-full ${width} z-20 transform transition-transform duration-300 ${
        open
          ? 'translate-x-0'
          : side === 'left'
          ? '-translate-x-full'
          : 'translate-x-full'
      } shadow-2xl bg-[var(--color-surface)] flex flex-col border-${side === 'left' ? 'r' : 'l'} border-[var(--color-border)]`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] flex-shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="tap-target flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}

/**
 * PanelToggle — header button that opens/closes a side drawer. Shows a
 * text label next to the icon so users can see the panels exist even when
 * they are collapsed. A subtle accent border when closed invites the click;
 * filled accent when open confirms the active state.
 */
function PanelToggle({ children, onClick, active, label, ...rest }) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`tap-target flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-lg border transition-colors ${
        active
          ? 'text-[var(--color-accent)] bg-[var(--color-card)] border-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-card)]'
      }`}
    >
      {children}
      <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </button>
  );
}

function NavButton({ icon, label }) {
  return (
    <button className="tap-target px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] transition-colors">
      <span className="text-base sm:text-sm">{icon}</span>
      <span className="hidden sm:inline ml-1">{label}</span>
    </button>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 4v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
