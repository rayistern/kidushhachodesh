/**
 * BookChapter — one chapter of the plain-language companion.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial**
 *  SURFACE CATEGORY: internal UI (teaching)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Route: `/book/:chapter`. The Rambam's own words live at `/text/:chapter`;
 * this is the companion written for a reader with no background in
 * astronomy or mathematics.
 *
 * ── Attribution ──
 * `/text` labels each plain-language note individually, because there
 * the notes sit between halachot and could be mistaken for them. Here
 * the entire page is editorial, so a label on every paragraph would be
 * noise. Instead there is one persistent, non-dismissible strip under
 * the header, and every section carries a chip linking to the halacha
 * it is explaining — so the reader is always one click from the actual
 * text and never in doubt about which is which.
 *
 * Store-free, like the `/text` pages. The chain map's status is derived
 * from the chapter in the URL, so there is nothing to persist and
 * nothing that can go stale.
 */
import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { bookChapter, hasBookChapter } from '../../content/book';
import { CHAPTER_TITLES, isValidChapter } from '../../content/khChapters';
import { renderEmphasis } from '../../lib/markup';
import ChainMap from './ChainMap';
import { figureById } from './interactives';
import { FigureDefaults } from '../text/interactives/InteractiveCard';

// In the book the figure IS the explanation, and the prose above it
// says "watch this" — so the calculators open by default here, while
// the same components stay collapsed under a halacha in /text.
const BOOK_FIGURE_DEFAULTS = { defaultOpen: true };

export default function BookChapter() {
  const { chapter: chapterParam } = useParams();
  const chapter = Number(chapterParam);
  const [activeNodeId, setActiveNodeId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveNodeId(null);
  }, [chapter]);

  if (!isValidChapter(chapter)) return <Navigate to="/book" replace />;

  const content = bookChapter(chapter);
  const sourceTitle = CHAPTER_TITLES[chapter];

  if (!content) {
    return <NotYetWritten chapter={chapter} sourceTitle={sourceTitle} />;
  }

  return (
    <FigureDefaults.Provider value={BOOK_FIGURE_DEFAULTS}>
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to="/book" className="text-xs text-[var(--color-accent)] hover:underline">
                ← The whole book
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold">{content.title}</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Chapter {chapter}
                {sourceTitle ? ` · ${sourceTitle.en}` : ''}
                {content.hebrewTitle ? ' · ' : ''}
                {content.hebrewTitle && (
                  <span className="hebrew-text text-[var(--color-accent)]">
                    {content.hebrewTitle}
                  </span>
                )}
              </p>
            </div>
            <Link
              to={`/text/${chapter}`}
              className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-accent)] hover:bg-[var(--color-card)]"
            >
              Read the Rambam's own words →
            </Link>
          </div>

          {content.subtitle && (
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-secondary)]">
              {content.subtitle}
            </p>
          )}

          <p className="mt-3 rounded border-l-2 border-[var(--color-gold)]/50 bg-[var(--color-card)] px-3 py-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            This is a plain-language companion written for this site. It is{' '}
            <strong className="text-[var(--color-text)]">not the Rambam</strong> and not a
            translation — every section links to his own words.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ChainMap currentChapter={chapter} activeNodeId={activeNodeId} />

        <main className="min-w-0">
          <Recap recap={content.recap} />

          {content.sections.map((section) => (
            <BookSection
              key={section.id}
              section={section}
              chapter={chapter}
              onEnter={() => section.nodeId && setActiveNodeId(section.nodeId)}
            />
          ))}

          {content.closing && <Closing closing={content.closing} chapter={chapter} />}
        </main>
      </div>
    </div>
    </FigureDefaults.Provider>
  );
}

function Recap({ recap }) {
  if (!recap) return null;
  return (
    <section className="mb-8 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
        Where we've got to
      </h2>
      {recap.settled?.length > 0 && (
        <>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            By now you can:
          </p>
          <ul className="mt-1 space-y-1">
            {recap.settled.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-[var(--color-gold)]" aria-hidden="true">
                  ✓
                </span>
                <span
                  className="text-[var(--color-text-secondary)]"
                  dangerouslySetInnerHTML={{ __html: renderEmphasis(item) }}
                />
              </li>
            ))}
          </ul>
        </>
      )}
      {recap.thisChapter && (
        <p
          className="mt-3 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderEmphasis(recap.thisChapter) }}
        />
      )}
      {recap.byTheEnd && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text)]">By the end of this chapter: </strong>
          <span dangerouslySetInnerHTML={{ __html: renderEmphasis(recap.byTheEnd) }} />
        </p>
      )}
    </section>
  );
}

function BookSection({ section, chapter, onEnter }) {
  const Figure = section.interactive ? figureById(section.interactive) : null;
  const anchor = section.source ? sourceAnchor(section.source) : null;

  return (
    <section id={section.id} className="mb-10 scroll-mt-24" onMouseEnter={onEnter}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold">{section.heading}</h2>
        {section.source && (
          <Link
            to={anchor ? `/text/${chapter}#halacha-${anchor}` : `/text/${chapter}`}
            className="font-mono text-[10px] text-[var(--color-gold)] hover:underline"
            title="Open the Rambam's own words for this step"
          >
            {section.source} →
          </Link>
        )}
      </div>

      <div className="mt-2 space-y-3">
        {section.body.map((paragraph, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-[var(--color-text-secondary)]"
            dangerouslySetInnerHTML={{ __html: renderEmphasis(paragraph) }}
          />
        ))}
      </div>

      {Figure && (
        <React.Suspense
          fallback={
            <div className="my-4 rounded-xl border border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              Loading…
            </div>
          }
        >
          <Figure />
        </React.Suspense>
      )}
    </section>
  );
}

/** "KH 14:5" → "5", for deep-linking the anchors /text already emits. */
function sourceAnchor(source) {
  const match = /(\d+):(\d+)/.exec(source);
  return match ? match[2] : null;
}

function Closing({ closing, chapter }) {
  const next = chapter + 1;
  return (
    <section className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
        What you have now
      </h2>
      <ul className="mt-2 space-y-1">
        {closing.have.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-[var(--color-gold)]" aria-hidden="true">
              ✓
            </span>
            <span
              className="text-[var(--color-text-secondary)]"
              dangerouslySetInnerHTML={{ __html: renderEmphasis(item) }}
            />
          </li>
        ))}
      </ul>
      {closing.missing?.length > 0 && (
        <>
          <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
            What is still missing
          </h3>
          {closing.missing.map((item, i) => (
            <p
              key={i}
              className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]"
              dangerouslySetInnerHTML={{ __html: renderEmphasis(item) }}
            />
          ))}
        </>
      )}
      {isValidChapter(next) && (
        <Link
          to={hasBookChapter(next) ? `/book/${next}` : `/text/${next}`}
          className="mt-4 inline-block rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white"
        >
          {hasBookChapter(next)
            ? `On to chapter ${next} →`
            : `Chapter ${next} in the Rambam's words →`}
        </Link>
      )}
    </section>
  );
}

function NotYetWritten({ chapter, sourceTitle }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Link to="/book" className="text-xs text-[var(--color-accent)] hover:underline">
          ← The whole book
        </Link>
        <h1 className="mt-2 text-xl font-bold">
          Chapter {chapter} is not written yet
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          The plain-language companion is being written a chapter at a time. This one —{' '}
          {sourceTitle?.en} — is still only available in the Rambam's own words.
        </p>
        <Link
          to={`/text/${chapter}`}
          className="mt-4 inline-block rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm text-white"
        >
          Read chapter {chapter} in the source →
        </Link>
        <div className="mt-8">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
            The whole calculation
          </div>
          <ChainMap currentChapter={chapter} variant="full" />
        </div>
      </div>
    </div>
  );
}
