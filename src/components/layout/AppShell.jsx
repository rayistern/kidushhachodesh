import React, { useEffect, useRef } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import Scene3D from '../3d/Scene';
import EclipticRibbon from '../visualizations/EclipticRibbon';

/**
 * AppShell — three-zone layout with auto-collapsing side panels.
 *
 * Wide viewports (>= 768px): three columns side-by-side, both panels pinned
 * open by default. The 3D scene fills whatever space is left.
 *
 * Narrow viewports (< 768px): the 3D scene is full-bleed and the side
 * panels become absolute drawers that overlay the scene. They default
 * closed; toggle them from the header icons. Only one drawer can be open
 * at a time on mobile (toggling one closes the other). Drawers can be
 * dismissed by tapping the backdrop or swiping them off-screen.
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

  // On narrow screens panels overlay; on wide screens they're inline.
  const overlay = !isWideViewport;
  const anyPanelOpen = leftPanelOpen || rightPanelOpen;

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
          <h1 className="text-sm sm:text-xl font-bold text-[var(--color-text)] truncate">
            <span className="hebrew-text text-lg sm:text-2xl">קידוש החודש</span>
          </h1>
          <span className="hidden md:inline text-sm text-[var(--color-text-secondary)]">
            Rambam's Celestial Dashboard
          </span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <NavButton icon="🔭" label="Explore" />
          <NavButton icon="🧮" label="Calculate" />
          <NavButton icon="📖" label="Learn" />
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
        <PanelDrawer
          side="left"
          open={leftPanelOpen}
          overlay={overlay}
          width={overlay ? 'w-[min(85vw,340px)]' : 'w-72'}
          onClose={() => setLeftPanelOpen(false)}
          title="Values"
        >
          <Sidebar />
        </PanelDrawer>

        {/* Center — ecliptic ribbon + 3D visualization stacked vertically.
            The ribbon stays fixed at the top so it's always visible while
            the 3D scene fills the rest of the column. */}
        <main className="flex-1 relative min-w-0 flex flex-col">
          <EclipticRibbon />
          <div className="flex-1 relative min-h-0">
            <Scene3D dimmed={overlay && anyPanelOpen} />
          </div>
        </main>

        {/* Right info panel */}
        <PanelDrawer
          side="right"
          open={rightPanelOpen}
          overlay={overlay}
          width={overlay ? 'w-[min(90vw,380px)]' : 'w-80'}
          onClose={() => setRightPanelOpen(false)}
          title="Drill-Down"
        >
          <InfoPanel />
        </PanelDrawer>

        {/* Backdrop on mobile when a panel is open */}
        {overlay && anyPanelOpen && (
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
 * PanelDrawer — handles inline vs overlay positioning + slide animation.
 * On overlay (mobile) it adds a sticky close header and supports swipe
 * dismissal in the natural off-screen direction.
 */
function PanelDrawer({ side, open, overlay, width, children, onClose, title }) {
  const startX = useRef(null);
  const deltaX = useRef(0);
  const containerRef = useRef(null);

  // Touch handlers — only used in overlay mode. Drag the drawer in the
  // direction of dismissal (left for the left drawer, right for the right
  // drawer) and release past 60px to close.
  const handleTouchStart = (e) => {
    if (!overlay) return;
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const handleTouchMove = (e) => {
    if (!overlay || startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    // Only allow drag in the dismiss direction
    const dismissDx = side === 'left' ? Math.min(0, dx) : Math.max(0, dx);
    deltaX.current = dismissDx;
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${dismissDx}px)`;
      containerRef.current.style.transition = 'none';
    }
  };
  const handleTouchEnd = () => {
    if (!overlay || startX.current == null) return;
    if (containerRef.current) {
      containerRef.current.style.transition = '';
      containerRef.current.style.transform = '';
    }
    if (Math.abs(deltaX.current) > 60) onClose && onClose();
    startX.current = null;
    deltaX.current = 0;
  };

  if (overlay) {
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
        } shadow-2xl bg-[var(--color-surface)] flex flex-col`}
      >
        {/* Mobile-only sticky close header so the user always has an
            obvious way out without aiming at the tiny header buttons. */}
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
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 transition-[width] duration-300 overflow-hidden ${
        open ? width : 'w-0'
      }`}
    >
      <div className={width + ' h-full'}>{children}</div>
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
