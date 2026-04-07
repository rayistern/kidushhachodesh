import React, { useEffect } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import Scene3D from '../3d/Scene';

/**
 * AppShell — three-zone layout with auto-collapsing side panels.
 *
 * Wide viewports (>= 768px): three columns side-by-side, both panels pinned
 * open by default. The 3D scene fills whatever space is left.
 *
 * Narrow viewports (< 768px): the 3D scene is full-bleed and the side
 * panels become absolute-positioned drawers that overlay the scene. They
 * default closed; toggle them from the header icons.
 *
 * The user can collapse panels on any size — the only difference is the
 * default state and whether they overlay or push.
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

  // Recompute on date change
  useEffect(() => {
    compute(currentDate);
  }, [currentDate, compute]);

  // Watch for viewport changes — auto-collapse panels on mobile,
  // auto-expand on desktop. Only triggers on the wide↔narrow transition
  // so the user's manual toggling is preserved within a size class.
  useEffect(() => {
    let prevWide = window.innerWidth >= 768;
    setIsWideViewport(prevWide);

    const handler = () => {
      const wide = window.innerWidth >= 768;
      if (wide !== prevWide) {
        prevWide = wide;
        setIsWideViewport(wide);
        setLeftPanelOpen(wide);
        setRightPanelOpen(wide);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [setIsWideViewport, setLeftPanelOpen, setRightPanelOpen]);

  // On narrow screens panels overlay; on wide screens they're inline.
  const overlay = !isWideViewport;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleLeftPanel}
            aria-label="Toggle values panel"
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]"
          >
            <HamburgerIcon />
          </button>
          <h1 className="text-base sm:text-xl font-bold text-[var(--color-text)] truncate">
            <span className="hebrew-text text-lg sm:text-2xl">קידוש החודש</span>
          </h1>
          <span className="hidden md:inline text-sm text-[var(--color-text-secondary)]">
            Rambam's Celestial Dashboard
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NavButton icon="🔭" label="Explore" />
          <NavButton icon="🧮" label="Calculate" />
          <NavButton icon="📖" label="Learn" />
          <button
            onClick={toggleRightPanel}
            aria-label="Toggle drill-down panel"
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]"
          >
            <PanelIcon />
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left sidebar — date control + summary values */}
        <PanelDrawer
          side="left"
          open={leftPanelOpen}
          overlay={overlay}
          width="w-72"
        >
          <Sidebar />
        </PanelDrawer>

        {/* Center — 3D visualization (always full-bleed in its container) */}
        <main className="flex-1 relative min-w-0">
          <div className="absolute inset-0">
            <Scene3D />
          </div>
        </main>

        {/* Right info panel */}
        <PanelDrawer
          side="right"
          open={rightPanelOpen}
          overlay={overlay}
          width="w-80"
        >
          <InfoPanel />
        </PanelDrawer>

        {/* Backdrop on mobile when a panel is open */}
        {overlay && (leftPanelOpen || rightPanelOpen) && (
          <div
            onClick={() => {
              setLeftPanelOpen(false);
              setRightPanelOpen(false);
            }}
            className="absolute inset-0 bg-black/40 z-10"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

/**
 * PanelDrawer — handles inline vs overlay positioning + slide animation.
 */
function PanelDrawer({ side, open, overlay, width, children }) {
  // Inline (desktop): the panel takes its width slot in the flex row.
  // When closed, collapses to width 0 with overflow hidden.
  // Overlay (mobile): absolute positioned, slides in from the side, z-20.
  if (overlay) {
    return (
      <div
        className={`absolute top-0 ${side}-0 h-full ${width} z-20 transform transition-transform duration-300 ${
          open
            ? 'translate-x-0'
            : side === 'left'
            ? '-translate-x-full'
            : 'translate-x-full'
        } shadow-2xl`}
      >
        {children}
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

function NavButton({ icon, label }) {
  return (
    <button className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] transition-colors">
      <span>{icon}</span>
      <span className="hidden sm:inline ml-1">{label}</span>
    </button>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 4v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
