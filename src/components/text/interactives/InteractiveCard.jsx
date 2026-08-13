/**
 * InteractiveCard — the frame every in-text interactive sits in.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal UI (chrome)
 * ═══════════════════════════════════════════════════════════════════
 *
 * These cards interrupt the halachot they explain, so they are visually
 * marked off from the text and collapsed by default on the reader's
 * first visit to a chapter — a person reading the Rambam straight
 * through should be able to do that without stepping over widgets. The
 * heading carries the source reference so it is always clear which
 * halachot the interactive is claiming to illustrate.
 */
import React, { useState } from 'react';

/**
 * Lets a whole surface change how these cards open, without every card
 * having to be edited or every call site passing a prop.
 *
 * In `/text` a card interrupts the halacha it sits under, so it starts
 * collapsed — a reader going straight through the Rambam should not
 * have to step over widgets. In `/book` the figure *is* the
 * explanation, and the prose above it says "watch this", so it starts
 * open. Same components, opposite defaults, one provider.
 */
export const FigureDefaults = React.createContext({ defaultOpen: false });

export default function InteractiveCard({ title, source, blurb, defaultOpen, children }) {
  const fromContext = React.useContext(FigureDefaults);
  const [open, setOpen] = useState(defaultOpen ?? fromContext.defaultOpen);

  return (
    <section className="my-6 overflow-hidden rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-card)] transition-colors"
      >
        <span className="text-base" aria-hidden="true">
          🧮
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[var(--color-text)]">{title}</span>
          <span className="block text-xs text-[var(--color-text-secondary)]">
            <span className="font-mono text-[var(--color-gold)]">{source}</span>
            {blurb ? ` — ${blurb}` : ''}
          </span>
        </span>
        <span
          className={`shrink-0 text-xs text-[var(--color-text-secondary)] transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] px-4 py-4">{children}</div>
      )}
    </section>
  );
}

/** Labelled degree/minute/second entry, shared by the calculators. */
export function DmsInput({ label, value, onChange, maxDegrees = 360 }) {
  const set = (key) => (e) => {
    const raw = e.target.value;
    const n = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(n)) return;
    onChange({ ...value, [key]: n });
  };

  const field = (key, max, suffix) => (
    <label className="flex items-center gap-1">
      <input
        type="number"
        value={value[key]}
        min={0}
        max={max}
        onChange={set(key)}
        className="w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-1 text-right font-mono text-sm"
        aria-label={`${label} ${suffix}`}
      />
      <span className="font-mono text-xs text-[var(--color-text-secondary)]">{suffix}</span>
    </label>
  );

  return (
    <div>
      <div className="mb-1 text-xs font-bold text-[var(--color-text-secondary)]">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {field('degrees', maxDegrees, '°')}
        {field('minutes', 59, "'")}
        {field('seconds', 59, '"')}
      </div>
    </div>
  );
}

/** A worked-example button that loads a preset into a calculator. */
export function PresetButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-2 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
    >
      {children}
    </button>
  );
}
