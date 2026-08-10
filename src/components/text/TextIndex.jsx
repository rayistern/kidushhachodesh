/**
 * TextIndex — table of contents for the full Hilchot Kidush HaChodesh.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **both** — links to all 19 chapters, across both the
 *  sighting/fixed-calendar and astronomical regimes.
 *  SURFACE CATEGORY: internal UI (navigation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is the landing page for `/text`. It is deliberately a plain
 * navigational surface: no calculation, no 3D, no store subscriptions,
 * so it renders instantly and links straight to each chapter page.
 *
 * The two sections mirror the halachic regime boundary — chapters 1-10
 * (sighting, testimony, fixed calendar) and 11-19 (the astronomy this
 * project's engine implements). Keeping that split visible in the
 * reader stops the two halves from being read as one continuous
 * method. See docs/OPEN_QUESTIONS.md Q3.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SECTIONS, CHAPTER_TITLES, HALACHA_COUNTS } from '../../content/khChapters';

export default function TextIndex() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              <span className="hebrew-text">הלכות קידוש החודש</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Mishneh Torah — Hilchot Kidush HaChodesh, all 19 chapters
            </p>
          </div>
          <Link to="/" className="shrink-0 text-sm text-[var(--color-accent)] hover:underline">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-10">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Hebrew (vocalized) alongside the English translation of Rabbi Eliyahu Touger.
          Text is loaded from{' '}
          <a
            href="https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            Sefaria
          </a>
          , so an internet connection is required.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.id}>
            <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-base sm:text-lg font-bold">{section.en}</h2>
              <span className="hebrew-text text-sm text-[var(--color-accent)]">{section.he}</span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                {`פרקים ${section.chapters[0]}–${section.chapters[section.chapters.length - 1]}`}
              </span>
            </div>
            <p className="mb-3 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {section.blurb}
            </p>

            <ul className="grid gap-2 sm:grid-cols-2">
              {section.chapters.map((ch) => (
                <li key={ch}>
                  <Link
                    to={`/text/${ch}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 hover:border-[var(--color-accent)] transition-colors"
                  >
                    <span className="shrink-0 w-8 text-center font-mono text-sm font-bold text-[var(--color-gold)]">
                      {ch}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{CHAPTER_TITLES[ch].en}</span>
                      <span className="hebrew-text block truncate text-xs text-[var(--color-text-secondary)]">
                        {CHAPTER_TITLES[ch].he}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-mono text-[var(--color-text-secondary)]">
                      {HALACHA_COUNTS[ch]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Chapter titles are editorial summaries added for navigation — the Rambam did not
          title the chapters of the Mishneh Torah. The trailing number is the count of
          halachot in each chapter.
        </p>
      </main>
    </div>
  );
}
