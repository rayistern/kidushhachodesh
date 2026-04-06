import React, { useState } from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { formatDms } from '../../engine/dmsUtils';
import { CONSTANTS, SOURCE_TYPES } from '../../engine/constants';

/**
 * Displays the full calculation derivation chain.
 * Each step shows:
 *   - Source badge (color-coded: blue=Rambam, amber=interpolated, purple=deduced, green=Losh)
 *   - Hebrew + English name
 *   - Result value
 *   - Expandable teaching note (from Rabbi Zajac / Rabbi Losh classes)
 */
export default function CalculationChain() {
  const calculation = useCalculationStore((s) => s.calculation);
  const selectedStepId = useCalculationStore((s) => s.selectedStepId);
  const selectStep = useCalculationStore((s) => s.selectStep);

  if (!calculation) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-secondary)]">
        Loading calculations...
      </div>
    );
  }

  const steps = calculation.steps;
  const selectedStep = selectedStepId ? calculation.stepMap[selectedStepId] : null;

  return (
    <div className="p-3">
      {/* Source legend */}
      <SourceLegend />

      {selectedStep ? (
        /* Focused view: show selected step in detail */
        <div>
          <button
            onClick={() => selectStep(null)}
            className="text-xs text-[var(--color-accent)] hover:underline mb-3"
          >
            &larr; Show all steps
          </button>
          <StepDetail step={selectedStep} onClickInput={selectStep} />
        </div>
      ) : (
        /* Overview: show all steps */
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            Calculation Chain
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            Click any step to see its full derivation and teaching notes
          </p>

          {/* Group steps by category */}
          <StepGroup label="Sun" hebrewLabel="השמש" steps={steps.filter(s => s.id.startsWith('sun') || s.id === 'daysFromEpoch')} onSelect={selectStep} />
          <StepGroup label="Moon" hebrewLabel="הירח" steps={steps.filter(s => s.id.startsWith('moon') || s.id === 'doubleElongation' || s.id === 'maslulHanachon' || s.id === 'nodePosition')} onSelect={selectStep} />
          <StepGroup label="Visibility" hebrewLabel="ראייה" steps={steps.filter(s => ['elongation', 'firstVisibilityAngle', 'moonVisibility', 'seasonalInfo'].includes(s.id))} onSelect={selectStep} />
        </div>
      )}

      {/* Both correction tables */}
      <div className="mt-4 space-y-4">
        <CorrectionTable
          title="Sun Correction Table"
          hebrewTitle="מנת מסלול השמש"
          reference="KH 13:4"
          table={CONSTANTS.SUN_MASLUL_CORRECTIONS}
          selectedMaslul={calculation.sun.maslul}
          maxCorrection="~2° at 90°"
        />
        <CorrectionTable
          title="Moon Correction Table"
          hebrewTitle="מנת מסלול הירח"
          reference="KH 15:4-6"
          table={CONSTANTS.MOON_MASLUL_CORRECTIONS}
          selectedMaslul={calculation.moon.maslulHanachon}
          maxCorrection="~5°8' at 100°"
        />
      </div>
    </div>
  );
}

// ─── Source Legend ─────────────────────────────────────────────

function SourceLegend() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        {expanded ? '▾' : '▸'} Source Color Key
      </button>
      {expanded && (
        <div className="mt-1 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] grid grid-cols-2 gap-1">
          {Object.entries(SOURCE_TYPES).map(([key, info]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <SourceBadge source={key} />
              <span className="text-[var(--color-text-secondary)]">{info.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Source Badge ──────────────────────────────────────────────

function SourceBadge({ source }) {
  const info = SOURCE_TYPES[source] || SOURCE_TYPES.rambam;
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[9px] font-bold flex-shrink-0"
      style={{ backgroundColor: info.color + '25', color: info.color, border: `1px solid ${info.color}50` }}
      title={info.description}
    >
      {info.icon}
    </span>
  );
}

// ─── Step Group ───────────────────────────────────────────────

function StepGroup({ label, hebrewLabel, steps, onSelect }) {
  if (steps.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1 flex items-center gap-1">
        {label} <span className="hebrew-text font-normal opacity-60">{hebrewLabel}</span>
      </div>
      {steps.map((step) => (
        <StepCard key={step.id} step={step} onClick={() => onSelect(step.id)} />
      ))}
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────

function StepCard({ step, onClick }) {
  const resultDisplay = typeof step.result === 'boolean'
    ? (step.result ? 'Yes' : 'No')
    : typeof step.result === 'object'
    ? JSON.stringify(step.result)
    : step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result));

  const sourceInfo = SOURCE_TYPES[step.source] || SOURCE_TYPES.rambam;

  return (
    <div
      onClick={onClick}
      className="p-2.5 mb-1.5 rounded-lg bg-[var(--color-card)] border cursor-pointer hover:border-[var(--color-accent)] transition-colors"
      style={{ borderColor: `${sourceInfo.color}30` }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <SourceBadge source={step.source} />
          <div className="min-w-0">
            <div className="text-xs font-medium text-[var(--color-text)] truncate">{step.name}</div>
            <div className="hebrew-text text-xs text-[var(--color-text-secondary)]">{step.hebrewName}</div>
          </div>
        </div>
        <div className="text-xs font-mono text-[var(--color-accent)] flex-shrink-0">
          {resultDisplay}
        </div>
      </div>
      {step.rambamRef && (
        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-60 ml-5">
          {step.rambamRef}
        </div>
      )}
    </div>
  );
}

// ─── Step Detail (Expanded) ──────────────────────────────────

function StepDetail({ step, onClickInput }) {
  const [showTeaching, setShowTeaching] = useState(true);
  const sourceInfo = SOURCE_TYPES[step.source] || SOURCE_TYPES.rambam;

  return (
    <div
      className="rounded-lg bg-[var(--color-card)] border p-4"
      style={{ borderColor: `${sourceInfo.color}50` }}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <SourceBadge source={step.source} />
          <h3 className="text-sm font-bold text-[var(--color-text)]">{step.name}</h3>
        </div>
        <div className="hebrew-text text-base text-[var(--color-accent)]">{step.hebrewName}</div>
        {step.rambamRef && (
          <div className="text-xs mt-1" style={{ color: sourceInfo.color }}>
            Rambam: {step.rambamRef}
          </div>
        )}
        {step.sourceNote && (
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 italic">
            {step.sourceNote}
          </div>
        )}
      </div>

      {/* Teaching Note (from classes) */}
      {step.teachingNote && (
        <div className="mb-3">
          <button
            onClick={() => setShowTeaching(!showTeaching)}
            className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
            style={{ color: SOURCE_TYPES.losh.color }}
          >
            {showTeaching ? '▾' : '▸'} Teaching Note
          </button>
          {showTeaching && (
            <div
              className="p-2.5 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: SOURCE_TYPES.losh.color + '08',
                borderLeft: `3px solid ${SOURCE_TYPES.losh.color}40`,
                color: 'var(--color-text-secondary)',
              }}
            >
              {step.teachingNote}
            </div>
          )}
        </div>
      )}

      {/* Formula */}
      {step.formula && (
        <div className="mb-3 p-2 rounded bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text-secondary)]">
          {step.formula}
        </div>
      )}

      {/* Inputs */}
      {step.inputs && (
        <div className="mb-3">
          <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
            Inputs
          </div>
          {Object.entries(step.inputs).map(([key, input]) => {
            const isClickable = typeof input.value === 'number';
            return (
              <div
                key={key}
                className={`flex justify-between py-1 border-b border-[var(--color-border)] border-opacity-30 text-xs ${
                  isClickable ? 'cursor-pointer hover:text-[var(--color-accent)]' : ''
                }`}
              >
                <span className="text-[var(--color-text-secondary)]">
                  {input.label || key}
                  {input.unit && <span className="opacity-50 ml-1">({input.unit})</span>}
                </span>
                <span className="font-mono text-[var(--color-text)]">
                  {typeof input.value === 'number' ? input.value.toFixed(4) : String(input.value)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Result */}
      <div
        className="p-2 rounded"
        style={{
          backgroundColor: sourceInfo.color + '10',
          border: `1px solid ${sourceInfo.color}30`,
        }}
      >
        <div className="text-xs text-[var(--color-text-secondary)]">Result</div>
        <div className="text-lg font-bold font-mono" style={{ color: sourceInfo.color }}>
          {step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result))}
          {step.unit && step.unit !== '' && step.unit !== 'boolean' && (
            <span className="text-xs ml-1 opacity-60">{step.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Correction Table (reusable for Sun and Moon) ────────────

function CorrectionTable({ title, hebrewTitle, reference, table, selectedMaslul, maxCorrection }) {
  const [expanded, setExpanded] = useState(false);
  const effectiveMaslul = selectedMaslul != null
    ? (selectedMaslul <= 180 ? selectedMaslul : 360 - selectedMaslul)
    : null;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1 flex items-center gap-1">
          {expanded ? '▾' : '▸'} {title}
          <span className="hebrew-text font-normal opacity-60">({hebrewTitle})</span>
          <span className="font-normal opacity-40 ml-auto">max: {maxCorrection}</span>
        </h4>
      </button>
      {expanded && (
        <>
          <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">
            {reference} — <SourceBadge source="rambam" /> Values at 10° intervals from the Rambam.
            Between entries: <SourceBadge source="approximated" /> interpolated.
          </div>
          <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--color-surface)]">
                  <th className="px-2 py-1 text-left text-[var(--color-text-secondary)]">Maslul</th>
                  <th className="px-2 py-1 text-right text-[var(--color-text-secondary)]">Correction</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => {
                  const isActive = effectiveMaslul != null && effectiveMaslul >= row.maslul &&
                    (i === table.length - 1 || effectiveMaslul < table[i + 1].maslul);
                  return (
                    <tr
                      key={row.maslul}
                      className={isActive ? 'bg-[var(--color-accent)] bg-opacity-15' : ''}
                    >
                      <td className="px-2 py-0.5 font-mono">{row.maslul}°</td>
                      <td className="px-2 py-0.5 text-right font-mono">
                        {formatDms(row.correction)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {effectiveMaslul != null && (
            <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Current: {formatDms(selectedMaslul)} (effective: {formatDms(effectiveMaslul)})
            </div>
          )}
        </>
      )}
    </div>
  );
}
