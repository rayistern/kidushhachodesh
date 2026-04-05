import React, { useEffect, Suspense, lazy } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import Scene3D from '../3d/Scene';

export default function AppShell() {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const compute = useCalculationStore((s) => s.compute);
  const viewMode = useVisualizationStore((s) => s.viewMode);

  // Recompute on date change
  useEffect(() => {
    compute(currentDate);
  }, [currentDate, compute]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--color-text)]">
            <span className="hebrew-text text-2xl">קידוש החודש</span>
          </h1>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Rambam's Celestial Dashboard
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <NavButton icon="🔭" label="Explore" />
          <NavButton icon="🧮" label="Calculate" />
          <NavButton icon="📖" label="Learn" />
        </nav>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — date control + summary values */}
        <Sidebar />

        {/* Center — 3D visualization */}
        <main className="flex-1 relative">
          <div className="absolute inset-0">
            <Scene3D />
          </div>
          {/* View controls overlay */}
          <ViewControls />
        </main>

        {/* Right panel — drill-down or Rambam text */}
        <InfoPanel />
      </div>

      {/* Bottom audio bar placeholder (for Phase 2) */}
      <footer className="h-10 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4">
        <span className="text-xs text-[var(--color-text-secondary)]">
          Audio sync coming soon — Rabbi Zajac's podcast chapters 12-17
        </span>
      </footer>
    </div>
  );
}

function NavButton({ icon, label }) {
  return (
    <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] transition-colors">
      {icon} {label}
    </button>
  );
}

function ViewControls() {
  const {
    sidewaysAxis, toggleSidewaysAxis,
    showGalgalim, toggleGalgalim,
    showDiscs, toggleDiscs,
    showLabels, toggleLabels,
    animationSpeed, setAnimationSpeed,
  } = useVisualizationStore();

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-10">
      <ToggleButton active={sidewaysAxis} onClick={toggleSidewaysAxis} label="Sideways (Rabbi Losh)" />
      <ToggleButton active={showGalgalim} onClick={toggleGalgalim} label="Galgalim" />
      <ToggleButton active={showDiscs} onClick={toggleDiscs} label="Orbital Discs" />
      <ToggleButton active={showLabels} onClick={toggleLabels} label="Labels" />
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-[var(--color-text-secondary)]">Speed:</span>
        {[1, 30, 365].map((s) => (
          <button
            key={s}
            onClick={() => setAnimationSpeed(s)}
            className={`px-2 py-0.5 rounded text-xs font-mono ${
              animationSpeed === s
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-card)] text-[var(--color-text-secondary)]'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)]'
          : 'bg-[var(--color-card)] text-[var(--color-text-secondary)]'
      }`}
    >
      {active ? '●' : '○'} {label}
    </button>
  );
}
