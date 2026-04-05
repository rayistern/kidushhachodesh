import React from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { formatDms } from '../../engine/dmsUtils';
import { CONSTANTS } from '../../engine/constants';

/**
 * Displays the full calculation derivation chain.
 * When a step is selected, shows that step prominently with its inputs traced back.
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
            Click any step to see its full derivation
          </p>
          {steps.map((step) => (
            <StepCard key={step.id} step={step} onClick={() => selectStep(step.id)} />
          ))}
        </div>
      )}

      {/* Maslul correction table always visible at bottom */}
      <MaslulTable selectedMaslul={calculation.sun.maslul} />
    </div>
  );
}

function StepCard({ step, onClick }) {
  const resultDisplay = typeof step.result === 'boolean'
    ? (step.result ? 'Yes' : 'No')
    : typeof step.result === 'object'
    ? JSON.stringify(step.result)
    : step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result));

  return (
    <div
      onClick={onClick}
      className="p-2.5 mb-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-medium text-[var(--color-text)]">{step.name}</div>
          <div className="hebrew-text text-xs text-[var(--color-text-secondary)]">{step.hebrewName}</div>
        </div>
        <div className="text-xs font-mono text-[var(--color-accent)]">
          {resultDisplay}
        </div>
      </div>
      {step.rambamRef && (
        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-60">
          {step.rambamRef}
        </div>
      )}
    </div>
  );
}

function StepDetail({ step, onClickInput }) {
  return (
    <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-accent)] border-opacity-50 p-4">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-[var(--color-text)]">{step.name}</h3>
        <div className="hebrew-text text-base text-[var(--color-accent)]">{step.hebrewName}</div>
        {step.rambamRef && (
          <div className="text-xs text-[var(--color-gold)] mt-1">
            Rambam: {step.rambamRef}
          </div>
        )}
      </div>

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
      <div className="p-2 rounded bg-[var(--color-accent)] bg-opacity-10 border border-[var(--color-accent)] border-opacity-30">
        <div className="text-xs text-[var(--color-text-secondary)]">Result</div>
        <div className="text-lg font-bold font-mono text-[var(--color-accent)]">
          {step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result))}
          {step.unit && step.unit !== '' && step.unit !== 'boolean' && (
            <span className="text-xs ml-1 opacity-60">{step.unit}</span>
          )}
        </div>
      </div>

      {/* Bug fix note */}
      {step.bugFix && (
        <div className="mt-2 p-2 rounded bg-yellow-900 bg-opacity-20 border border-yellow-600 border-opacity-30 text-xs text-yellow-300">
          Fixed: {step.bugFix}
        </div>
      )}
    </div>
  );
}

function MaslulTable({ selectedMaslul }) {
  const effectiveMaslul = selectedMaslul <= 180 ? selectedMaslul : 360 - selectedMaslul;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
        Maslul Correction Table (KH 13:4)
      </h4>
      <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--color-surface)]">
              <th className="px-2 py-1 text-left text-[var(--color-text-secondary)]">Maslul°</th>
              <th className="px-2 py-1 text-right text-[var(--color-text-secondary)]">Correction</th>
            </tr>
          </thead>
          <tbody>
            {CONSTANTS.MASLUL_CORRECTIONS.map((row, i) => {
              const isActive = effectiveMaslul >= row.maslul &&
                (i === CONSTANTS.MASLUL_CORRECTIONS.length - 1 || effectiveMaslul < CONSTANTS.MASLUL_CORRECTIONS[i + 1].maslul);
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
      <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
        Current sun maslul: {formatDms(selectedMaslul)} (effective: {formatDms(effectiveMaslul)})
      </div>
    </div>
  );
}
