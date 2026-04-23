import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFullCalculation } from '../../engine/pipeline';
import { formatDms } from '../../engine/dmsUtils';

/**
 * D6 — Compare two dates side-by-side. Runs the full calculation
 * pipeline for each date and shows a diff table. We skip the twin 3D
 * scenes (perf risk) and instead give a rich side-by-side table plus
 * a link back to the main dashboard to explore each date individually.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (consumer of `getFullCalculation`)
 *  SURFACE CATEGORY: internal UI
 * ═══════════════════════════════════════════════════════════════════
 * The date pickers are native HTML `<input type=date>` (civil dates).
 * Each date flows through `getFullCalculation` → the astronomical
 * pipeline → the diff table. The `daysFromEpoch` crossing for each
 * date happens inside the pipeline, not here.
 */
export default function CompareView() {
  const today = useMemo(() => new Date(), []);
  const monthAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const [dateA, setDateA] = useState(monthAgo.toISOString().slice(0, 10));
  const [dateB, setDateB] = useState(today.toISOString().slice(0, 10));

  const [calcA, setCalcA] = useState(null);
  const [calcB, setCalcB] = useState(null);

  useEffect(() => {
    try {
      setCalcA(getFullCalculation(new Date(dateA)));
    } catch (e) {
      console.error('Compare A calc failed', e);
    }
  }, [dateA]);

  useEffect(() => {
    try {
      setCalcB(getFullCalculation(new Date(dateB)));
    } catch (e) {
      console.error('Compare B calc failed', e);
    }
  }, [dateB]);

  const rows = useMemo(() => buildDiffRows(calcA, calcB), [calcA, calcB]);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold">
          <span className="hebrew-text">השוואה</span> — Compare two dates
        </h1>
        <Link to="/" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <DatePickerCard label="Date A" value={dateA} onChange={setDateA} calc={calcA} accent="var(--color-gold)" />
        <DatePickerCard label="Date B" value={dateB} onChange={setDateB} calc={calcB} accent="var(--color-accent)" />
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
          Diff — rows where the formatted value changes
        </div>
        {rows.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-[var(--color-text-secondary)]">
            {calcA && calcB ? 'No differences found.' : 'Computing…'}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--color-text-secondary)] uppercase tracking-wide text-[10px]">
                <th className="text-left px-3 py-1.5">Step</th>
                <th className="text-left px-3 py-1.5" style={{ color: 'var(--color-gold)' }}>A</th>
                <th className="text-left px-3 py-1.5" style={{ color: 'var(--color-accent)' }}>B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] border-opacity-30">
                  <td className="px-3 py-1.5">
                    <div>{r.name}</div>
                    {r.hebrewName && <div className="hebrew-text opacity-60 text-[10px]">{r.hebrewName}</div>}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-[var(--color-text)]">{r.a}</td>
                  <td className="px-3 py-1.5 font-mono text-[var(--color-text)]">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DatePickerCard({ label, value, onChange, calc, accent }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3" style={{ borderTop: `3px solid ${accent}` }}>
      <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-2 py-1.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-sm"
      />
      {calc && (
        <div className="mt-2 text-xs space-y-0.5">
          <Row label="Sun true" value={formatDms(calc.sun.trueLongitude)} />
          <Row label="Moon true" value={formatDms(calc.moon.trueLongitude)} />
          <Row label="Elongation" value={formatDms(calc.moon.elongation)} />
          <Row label="Visible" value={calc.moon.isVisible ? 'Yes' : 'No'} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function buildDiffRows(a, b) {
  if (!a || !b) return [];
  const mapA = a.stepMap || {};
  const mapB = b.stepMap || {};
  const ids = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  const rows = [];
  for (const id of ids) {
    const sa = mapA[id];
    const sb = mapB[id];
    const fa = sa?.formatted ?? '—';
    const fb = sb?.formatted ?? '—';
    if (fa !== fb) {
      rows.push({
        id,
        name: sa?.name || sb?.name || id,
        hebrewName: sa?.hebrewName || sb?.hebrewName,
        a: fa,
        b: fb,
      });
    }
  }
  return rows;
}
