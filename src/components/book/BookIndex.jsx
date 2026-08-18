/**
 * BookIndex — the front page of the plain-language companion.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial**
 *  SURFACE CATEGORY: internal UI (navigation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The map is the table of contents here rather than a sidebar. The
 * question a reader has on arriving is "what is all this for and how do
 * the pieces join up", and the chain answers exactly that — so it is
 * the page, not an ornament beside it.
 *
 * Chapters without book text link to the source reader, and say so.
 * The book is written a chapter at a time and the map stays honest
 * about which is which.
 */
import React from 'react';
import SiteCredit from '../layout/SiteCredit';
import { Link } from 'react-router-dom';
import ChainMap from './ChainMap';
import { writtenChapters } from '../../content/book';
import { CHAPTER_TITLES } from '../../content/khChapters';
import { bookChapter } from '../../content/book';

export default function BookIndex() {
  const written = writtenChapters();

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Kiddush HaChodesh, in plain words</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              A companion to the Rambam's chapters, written for someone with no background in
              astronomy or mathematics.
            </p>
          </div>
          <Link to="/" className="shrink-0 text-sm text-[var(--color-accent)] hover:underline">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <p className="rounded-lg border-l-2 border-[var(--color-gold)]/50 bg-[var(--color-card)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Everything here is editorial — written for this site, not a translation and not the
          Rambam. His own words are always one click away at{' '}
          <Link to="/text" className="text-[var(--color-accent)] hover:underline">
            the source reader
          </Link>
          . And everything the book computes can be watched on the evening sky itself, at{' '}
          <Link to="/sky" className="text-[var(--color-accent)] hover:underline">
            the Sky page
          </Link>
          .
        </p>

        <section className="mt-8">
          <h2 className="text-base font-bold">What the whole thing is trying to work out</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            One question, asked on one evening: <em>will the new moon be visible tonight?</em> The
            court needed to know, because the month began when it was seen. Everything below is
            the machinery for answering it — and each step exists because the one before it was
            not quite enough.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Read it in order and it is a single argument. Each box is a thing you work out; each
            one feeds the next.
          </p>

          <div className="mt-4">
            <ChainMap currentChapter={written[0] ?? 14} variant="full" />
          </div>
        </section>

        {written.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-bold">Chapters written so far</h2>
            <ul className="mt-2 space-y-2">
              {written.map((n) => {
                const content = bookChapter(n);
                return (
                  <li key={n}>
                    <Link
                      to={`/book/${n}`}
                      className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 hover:border-[var(--color-accent)] transition-colors"
                    >
                      <span className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-bold text-[var(--color-gold)]">
                          {n}
                        </span>
                        <span className="text-sm font-bold">{content.title}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">
                        {content.subtitle}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[var(--color-text-secondary)] opacity-70">
                        The Rambam's chapter {n}: {CHAPTER_TITLES[n]?.en}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-[var(--color-text-secondary)]">
              The rest of the chapters are available in the Rambam's own words, with calculators,
              at <Link to="/text" className="text-[var(--color-accent)] hover:underline">/text</Link>.
            </p>
          </section>
        )}
        <SiteCredit />
      </main>
    </div>
  );
}
