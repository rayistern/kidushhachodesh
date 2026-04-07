import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import CalculationChain from '../dashboard/CalculationChain';
import RambamReader from '../content/RambamReader';
import VisibilityHorizon from '../visualizations/VisibilityHorizon';
import GuidedWalkthrough from '../content/GuidedWalkthrough';
import { useT } from '../../i18n';

export default function InfoPanel() {
  const t = useT();
  const rightPanel = useUIStore((s) => s.rightPanel);
  const setRightPanel = useUIStore((s) => s.setRightPanel);

  return (
    <aside
      id="kh-right-panel"
      className="w-full h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto flex flex-col"
      aria-label="Details panel"
    >
      {/* Panel tabs */}
      <div className="flex border-b border-[var(--color-border)]" role="tablist">
        <PanelTab
          active={rightPanel === 'drilldown'}
          onClick={() => setRightPanel('drilldown')}
          label={t('drilldown')}
        />
        <PanelTab
          active={rightPanel === 'visibility'}
          onClick={() => setRightPanel('visibility')}
          label={t('visibility')}
        />
        <PanelTab
          active={rightPanel === 'rambam'}
          onClick={() => setRightPanel('rambam')}
          label={t('rambam')}
        />
        <PanelTab
          active={rightPanel === 'walkthrough'}
          onClick={() => setRightPanel('walkthrough')}
          label={t('tour')}
        />
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {rightPanel === 'drilldown' && <CalculationChain />}
        {rightPanel === 'visibility' && <VisibilityHorizon />}
        {rightPanel === 'rambam' && <RambamReader />}
        {rightPanel === 'walkthrough' && <GuidedWalkthrough />}
      </div>
    </aside>
  );
}

function PanelTab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex-1 px-4 py-3 text-xs font-medium transition-colors min-h-[44px] ${
        active
          ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] active:text-[var(--color-text)]'
      }`}
    >
      {label}
    </button>
  );
}
