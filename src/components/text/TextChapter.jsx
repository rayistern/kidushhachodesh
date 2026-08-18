/**
 * TextChapter — one chapter of Hilchot Kidush HaChodesh on its own page.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **both** — serves all 19 chapters, across both regimes.
 *  SURFACE CATEGORY: internal UI (Rambam text display)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Route: `/text/:chapter`. Distinct from the `RambamReader` panel in
 * the dashboard, which is a narrow side-panel bound to the UI store's
 * `activeChapter` and scoped to the astronomical chapters (11-19).
 * This page is a standalone reading surface for the whole text, so it
 * keeps its own local state and touches no store.
 *
 * Hebrew is the vocalized Torat Emet edition; English is Touger. Both
 * are selected by version title in `lib/sefaria.js` — see the notes
 * there on why position in the response is not trusted.
 *
 * The Touger text carries inline footnotes as
 * `<sup class="footnote-marker">` + `<i class="footnote">` pairs. They
 * are collapsed by default (CSS in index.css) because reading them
 * inline breaks the sentence mid-clause; the "Footnotes" toggle adds
 * `kh-show-footnotes` to reveal them as indented blocks.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { fetchChapter } from '../../lib/sefaria';
import { CHAPTER_TITLES, isValidChapter, sectionForChapter } from '../../content/khChapters';
import { interactivesForChapter } from './interactives';
import { splitParagraphs } from '../../lib/rambamText';
import { explanationsForChapter, hasExplanations } from '../../content/plainExplanations';
import { hasBookChapter } from '../../content/book';
import { renderEmphasis } from '../../lib/markup';

export default function TextChapter() {
  const { chapter: chapterParam } = useParams();
  const chapter = Number(chapterParam);

  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHebrew, setShowHebrew] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [showPlain, setShowPlain] = useState(true);

  const valid = isValidChapter(chapter);

  useEffect(() => {
    if (!valid) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setText(null);
    fetchChapter(chapter, { signal: controller.signal })
      .then((data) => {
        setText(data);
        setLoading(false);
      })
      .catch((err) => {
        // Only an aborted fetch reaches here; a superseded chapter
        // request must not clear the loading state of the new one.
        if (err?.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, [chapter, valid]);

  // Jumping between chapters should land at the top of the new chapter,
  // not wherever the previous one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapter]);

  if (!valid) return <Navigate to="/text" replace />;

  const title = CHAPTER_TITLES[chapter];
  const section = sectionForChapter(chapter);
  const prev = chapter > 1 ? chapter - 1 : null;
  const next = chapter < 19 ? chapter + 1 : null;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] safe-top">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link to="/text" className="text-xs text-[var(--color-accent)] hover:underline">
                ← All chapters
              </Link>
              <h1 className="truncate text-base sm:text-xl font-bold">
                Chapter {chapter}: {title.en}
              </h1>
              <div className="hebrew-text truncate text-sm text-[var(--color-accent)]">
                פרק {chapter}: {title.he}
              </div>
            </div>
            <ChapterPager prev={prev} next={next} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Toggle active={showHebrew} onClick={() => setShowHebrew((v) => !v)}>
              Hebrew
            </Toggle>
            <Toggle active={showEnglish} onClick={() => setShowEnglish((v) => !v)}>
              English
            </Toggle>
            <Toggle active={showFootnotes} onClick={() => setShowFootnotes((v) => !v)}>
              Footnotes
            </Toggle>
            {hasExplanations(chapter) && (
              <Toggle active={showPlain} onClick={() => setShowPlain((v) => !v)}>
                In plain words
              </Toggle>
            )}
            {hasBookChapter(chapter) && (
              <Link
                to={`/book/${chapter}`}
                className="rounded px-2 py-0.5 text-xs text-[var(--color-gold)] hover:bg-[var(--color-card)]"
                title="A plain-language walk through this chapter"
              >
                📗 Explain this chapter →
              </Link>
            )}
            {section && (
              <span className="ml-auto hidden sm:inline text-xs text-[var(--color-text-secondary)]">
                {section.en}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {loading && (
          <div className="animate-pulse text-sm text-[var(--color-text-secondary)]">
            Loading chapter {chapter} from Sefaria…
          </div>
        )}

        {text?.error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            <div className="font-bold">Could not load chapter {chapter}.</div>
            <div className="mt-1 opacity-80">{text.error}</div>
            <div className="mt-2 opacity-80">
              The text is fetched live from Sefaria — check your internet connection and
              reload.
            </div>
          </div>
        )}

        {text && !text.error && (
          <Halachot
            text={text}
            chapter={chapter}
            showHebrew={showHebrew}
            showEnglish={showEnglish}
            showFootnotes={showFootnotes}
            showPlain={showPlain}
          />
        )}

        {text && !text.error && (
          <footer className="mt-8 border-t border-[var(--color-border)] pt-4">
            <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {text.heVersionTitle && <div>Hebrew: {text.heVersionTitle}</div>}
              {text.enVersionTitle && <div>English: {text.enVersionTitle}</div>}
              <div className="mt-1">
                Engine and site logic built on{' '}
                <a
                  href="https://github.com/rayistern/kidushhachodesh"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  rayistern/kidushhachodesh
                </a>
                . Text courtesy of{' '}
                <a
                  href={`https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.${chapter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  Sefaria
                </a>
                .
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <ChapterPager prev={prev} next={next} />
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

function Halachot({ text, chapter, showHebrew, showEnglish, showFootnotes, showPlain }) {
  const explanations = explanationsForChapter(chapter);
  // Hebrew and English are parallel arrays of the same halachot. They
  // agree in length on every chapter of this text today, but a version
  // that splits a halacha differently would make them diverge — so pair
  // by index up to the longer of the two rather than assuming a match.
  const count = Math.max(text.hebrew.length, text.english.length);

  const bothColumns = showHebrew && showEnglish;
  const rowClass = bothColumns
    ? 'grid gap-x-8 gap-y-2 lg:grid-cols-2'
    : 'grid gap-y-2';

  const indices = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  // Group the chapter's interactives by the halacha they follow. An
  // entry pointing past the end of the served text is pulled back to the
  // last halacha rather than silently disappearing — a chapter that
  // Sefaria serves shorter than expected should still show its cards.
  const cardsByHalacha = useMemo(() => {
    const map = new Map();
    if (count === 0) return map;
    for (const item of interactivesForChapter(chapter)) {
      const slot = Math.min(item.after, count);
      const list = map.get(slot) || [];
      list.push(item);
      map.set(slot, list);
    }
    return map;
  }, [chapter, count]);

  if (count === 0) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)]">
        No text available for this chapter.
      </div>
    );
  }

  if (!showHebrew && !showEnglish) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)]">
        Both languages are hidden — turn Hebrew or English back on above.
      </div>
    );
  }

  return (
    <div className={showFootnotes ? 'kh-show-footnotes space-y-8' : 'space-y-8'}>
      {indices.map((i) => {
        const he = text.hebrew[i];
        const en = text.english[i];
        const id = `halacha-${i + 1}`;
        const cards = cardsByHalacha.get(i + 1);
        return (
          <React.Fragment key={i}>
          <article id={id} className="scroll-mt-32">
            <a
              href={`#${id}`}
              className="mb-2 inline-block font-mono text-xs font-bold text-[var(--color-gold)] hover:underline"
              title={`Link to ${chapter}:${i + 1}`}
            >
              {chapter}:{i + 1}
            </a>
            <div className={rowClass}>
              {/* Hebrew first in DOM order so it reads first when a
                  screen reader or a stacked mobile layout linearizes
                  the row; on wide screens the RTL column sits right. */}
              {showHebrew && he && (
                <Prose
                  html={he}
                  className="hebrew-text text-[15px] leading-loose text-[var(--color-text)] lg:order-2"
                />
              )}
              {showEnglish && en && (
                <Prose
                  html={en}
                  className="text-sm leading-relaxed text-[var(--color-text-secondary)] lg:order-1"
                />
              )}
            </div>
            {showPlain && explanations[i + 1] && (
              <PlainWords text={explanations[i + 1]} />
            )}
          </article>
          {cards?.map(({ id: cardId, Component }) => (
            <React.Suspense
              key={cardId}
              fallback={
                <div className="my-6 rounded-xl border border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                  Loading interactive…
                </div>
              }
            >
              <Component />
            </React.Suspense>
          ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * A plain-language note under one halacha.
 *
 * Labelled on every instance rather than once at the top of the page,
 * because a reader arriving at a deep link, or scrolling past the
 * header, would otherwise meet unattributed plain English sitting
 * directly beneath a halacha and reasonably take it for the Rambam's
 * own words. The left rule and the heading are load-bearing, not
 * decoration.
 */
function PlainWords({ text }) {
  const paragraphs = text.split('\n\n');
  return (
    <aside className="mt-3 border-l-2 border-[var(--color-gold)]/40 pl-3">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-gold)]/80">
        In plain words — editor's note, not the Rambam
      </div>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={`text-[13px] leading-relaxed text-[var(--color-text-secondary)] ${i > 0 ? 'mt-2' : ''}`}
          dangerouslySetInnerHTML={{ __html: renderEmphasis(p) }}
        />
      ))}
    </aside>
  );
}

/**
 * One language's text for one halacha, broken at the paragraph
 * divisions the source marks. Long halachot are otherwise an
 * undivided block — KH 12:2 runs to eight thousand characters.
 */
function Prose({ html, className }) {
  const paragraphs = useMemo(() => splitParagraphs(html), [html]);

  return (
    <div className={`kh-halacha ${className}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={i > 0 ? 'mt-3' : undefined}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}
    </div>
  );
}

function ChapterPager({ prev, next }) {
  return (
    <nav className="flex shrink-0 items-center gap-1.5" aria-label="Chapter navigation">
      <PagerLink to={prev ? `/text/${prev}` : null}>← {prev ?? ''}</PagerLink>
      <PagerLink to={next ? `/text/${next}` : null}>{next ?? ''} →</PagerLink>
    </nav>
  );
}

function PagerLink({ to, children }) {
  const base = 'rounded px-2 py-1 font-mono text-xs';
  if (!to) {
    return <span className={`${base} text-[var(--color-text-secondary)] opacity-30`}>{children}</span>;
  }
  return (
    <Link
      to={to}
      className={`${base} bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors`}
    >
      {children}
    </Link>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-2 py-0.5 text-xs transition-colors ${
        active
          ? 'bg-[var(--color-accent)] text-white'
          : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
      }`}
    >
      {children}
    </button>
  );
}
