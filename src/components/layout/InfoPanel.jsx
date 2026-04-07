import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCalculationStore } from '../../stores/calculationStore';
import CalculationChain from '../dashboard/CalculationChain';
import RambamReader from '../content/RambamReader';

export default function InfoPanel() {
  const rightPanel = useUIStore((s) => s.rightPanel);
  const setRightPanel = useUIStore((s) => s.setRightPanel);

  return (
    <aside className="w-full h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto flex flex-col">
      {/* Panel tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <PanelTab
          active={rightPanel === 'drilldown'}
          onClick={() => setRightPanel('drilldown')}
          label="Drill-Down"
        />
        <PanelTab
          active={rightPanel === 'rambam'}
          onClick={() => setRightPanel('rambam')}
          label="Rambam Text"
        />
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {rightPanel === 'drilldown' && <CalculationChain />}
        {rightPanel === 'rambam' && <RambamReader />}
      </div>
    </aside>
  );
}

function PanelTab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
        active
          ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
      }`}
    >
      {label}
    </button>
  );
}
