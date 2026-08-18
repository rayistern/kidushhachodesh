/**
 * SignStrip — the twelve signs, in order, to glance at.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal UI (reference)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The book names signs by number with the name in brackets — "the 2nd
 * sign (Shor)" — so a reader never has to hold twelve unfamiliar words
 * to follow a sentence. This is the other half of that: somewhere to
 * look when they do want the mapping, rather than somewhere to have
 * memorised it from.
 *
 * Only rendered on chapters that lean on sign names (11, 17, 19), via a
 * `signStrip: true` flag in the chapter's content. On the chapters that
 * never mention a sign it would be furniture.
 *
 * Collapsed to a single line by default. The point is that it is
 * *available*, not that it is present.
 */
import React, { useState } from 'react';
import { CONSTANTS } from '../../engine/constants';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export default function SignStrip() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--color-card)] transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
          The twelve signs, in order
        </span>
        {!open && (
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--color-text-secondary)] opacity-70">
            1 {CONSTANTS.CONSTELLATION_TRANSLIT[0]} · 2 {CONSTANTS.CONSTELLATION_TRANSLIT[1]} · 3{' '}
            {CONSTANTS.CONSTELLATION_TRANSLIT[2]} · …
          </span>
        )}
        <span
          className={`ml-auto shrink-0 text-[10px] text-[var(--color-text-secondary)] transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)] px-3 py-2">
          <ol className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
            {CONSTANTS.CONSTELLATION_TRANSLIT.map((name, i) => (
              <li key={name} className="flex items-baseline gap-1.5 text-xs">
                <span className="w-7 shrink-0 text-right font-mono font-bold text-[var(--color-gold)]">
                  {ORDINALS[i]}
                </span>
                <span aria-hidden="true" className="text-[var(--color-text-secondary)]">
                  {SYMBOLS[i]}
                </span>
                <span className="min-w-0">
                  <span className="text-[var(--color-text)]">{name}</span>
                  <span className="hebrew-text ml-1 text-[var(--color-accent)] opacity-80">
                    {CONSTANTS.CONSTELLATIONS[i]}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
            Each is 30° wide, counted from the start of the 1st. The order is what the
            calculations use; the names are labels on it. Where this book needs a sign it says the
            number and puts the name in brackets, so you can read a sentence without stopping to
            remember which is which.
          </p>
        </div>
      )}
    </section>
  );
}
