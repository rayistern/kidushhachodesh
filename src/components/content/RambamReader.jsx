import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { parseHalachaHTML } from '../../lib/rambamChips';
import { tourForStep } from '../../content/walkthroughs';

const CHAPTERS = Array.from({ length: 9 }, (_, i) => i + 11);

const CHAPTER_TITLES = {
  11: { en: 'Astronomical Foundations', he: 'יסודות חשבון התקופות' },
  12: { en: 'Sun Mean Position', he: 'אמצע השמש' },
  13: { en: 'Sun True Position', he: 'מקום השמש האמיתי' },
  14: { en: 'Moon Mean Position', he: 'אמצע הירח' },
  15: { en: 'Moon True Position', he: 'מקום הירח האמיתי' },
  16: { en: "Moon's Latitude", he: 'רוחב הירח' },
  17: { en: 'Arc of Sighting', he: 'קשת הראייה' },
  18: { en: 'Visibility Conditions', he: 'תנאי הראייה' },
  19: { en: 'Additional Rules', he: 'כללים נוספים' },
};

const textCache = {};

async function fetchChapter(chapter) {
  if (textCache[chapter]) return textCache[chapter];
  try {
    const res = await fetch(
      `https://www.sefaria.org/api/v3/texts/Mishneh_Torah,_Sanctification_of_the_New_Month.${chapter}?version=hebrew|all&version=english|all`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    let hebrew = [];
    let english = [];

    if (data.versions) {
      const heVer = data.versions.find(v => v.language === 'he');
      const enVer = data.versions.find(v => v.language === 'en');
      if (heVer) hebrew = Array.isArray(heVer.text) ? heVer.text : [heVer.text];
      if (enVer) english = Array.isArray(enVer.text) ? enVer.text : [enVer.text];
    }

    const result = { hebrew, english, chapter };
    textCache[chapter] = result;
    return result;
  } catch (err) {
    console.error('Sefaria fetch failed:', err);
    return { hebrew: [], english: [], chapter, error: err.message };
  }
}

const chapterToStep = {
  12: 'sunMeanLongitude',
  13: 'sunMaslulCorrection',
  14: 'moonMeanLongitude',
  15: 'moonMaslulCorrection',
  16: 'moonLatitude',
  17: 'moonVisibility',
};

export default function RambamReader() {
  const activeChapter = useUIStore((s) => s.activeChapter);
  const setActiveChapter = useUIStore((s) => s.setActiveChapter);
  const bookmarks = useUIStore((s) => s.bookmarks);
  const toggleBookmark = useUIStore((s) => s.toggleBookmark);
  const showDrilldown = useUIStore((s) => s.showDrilldown);
  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const isWideViewport = useUIStore((s) => s.isWideViewport);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const pulseStep = useVisualizationStore((s) => s.pulseStep);

  const relatedStep = chapterToStep[activeChapter];
  const relatedTour = relatedStep ? tourForStep(relatedStep) : null;

  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHebrew, setShowHebrew] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [query, setQuery] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchChapter(activeChapter).then((data) => {
      setText(data);
      setLoading(false);
    });
  }, [activeChapter]);

  // Event delegation for chip clicks — single listener per container.
  const onContainerClick = useCallback((e) => {
    const btn = e.target.closest?.('button.kh-chip');
    if (!btn) return;
    const step = btn.getAttribute('data-chip-step');
    if (!step) return;
    selectStep(step);
    pulseStep(step);
    if (!isWideViewport) showDrilldown();
  }, [selectStep, pulseStep, showDrilldown, isWideViewport]);

  // Filter halachot by query (client-side substring; highlight handled below).
  const filteredIdx = useMemo(() => {
    if (!text || !query.trim()) return null;
    const q = query.trim().toLowerCase();
    const keep = [];
    const N = Math.max(text.hebrew.length, text.english.length);
    for (let i = 0; i < N; i++) {
      const he = stripHtml(text.hebrew[i] || '').toLowerCase();
      const en = stripHtml(text.english[i] || '').toLowerCase();
      if (he.includes(q) || en.includes(q)) keep.push(i);
    }
    return keep;
  }, [text, query]);

  return (
    <div className="flex flex-col h-full">
      {/* Chapter selector */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="flex flex-wrap gap-1 items-center">
          {CHAPTERS.map((ch) => (
            <button
              key={ch}
              onClick={() => { setActiveChapter(ch); setShowBookmarks(false); }}
              className={`px-2 py-1 rounded text-xs font-mono ${
                activeChapter === ch && !showBookmarks
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {ch}
            </button>
          ))}
          <button
            onClick={() => setShowBookmarks((b) => !b)}
            className={`px-2 py-1 rounded text-xs ml-auto ${
              showBookmarks ? 'bg-[var(--color-gold)] text-black' : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
            title="Bookmarks"
          >
            ★ {bookmarks.length}
          </button>
        </div>

        <div className="mt-2">
          <div className="text-sm font-bold text-[var(--color-text)]">
            {showBookmarks ? 'Bookmarks' : `Chapter ${activeChapter}: ${CHAPTER_TITLES[activeChapter]?.en}`}
          </div>
          {!showBookmarks && (
            <div className="hebrew-text text-sm text-[var(--color-accent)]">
              פרק {activeChapter}: {CHAPTER_TITLES[activeChapter]?.he}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2 items-center flex-wrap">
          <button
            onClick={() => setShowHebrew(!showHebrew)}
            className={`px-2 py-0.5 rounded text-xs ${showHebrew ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-card)] text-[var(--color-text-secondary)]'}`}
          >
            Hebrew
          </button>
          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className={`px-2 py-0.5 rounded text-xs ${showEnglish ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-card)] text-[var(--color-text-secondary)]'}`}
          >
            English
          </button>
          {relatedStep && !showBookmarks && (
            <button
              onClick={() => { selectStep(relatedStep); pulseStep(relatedStep); setRightPanel('drilldown'); }}
              className="px-2 py-0.5 rounded text-xs bg-[var(--color-gold)] bg-opacity-20 text-[var(--color-gold)]"
            >
              🧮 View Calculation
            </button>
          )}
          {relatedTour && !showBookmarks && (
            <button
              onClick={() => setRightPanel('walkthrough')}
              className="px-2 py-0.5 rounded text-xs bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)]"
              title="Open a guided tour related to this chapter"
            >
              🎬 Take the tour
            </button>
          )}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this chapter…"
          className="w-full mt-2 px-2 py-1 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-xs"
        />
      </div>

      {/* Text content */}
      <div className="flex-1 overflow-y-auto p-3" onClick={onContainerClick}>
        {showBookmarks ? (
          <BookmarksView bookmarks={bookmarks} toggleBookmark={toggleBookmark} setActiveChapter={(ch) => { setActiveChapter(ch); setShowBookmarks(false); }} />
        ) : (
          <>
            {loading && (
              <div className="text-sm text-[var(--color-text-secondary)] animate-pulse">
                Loading from Sefaria...
              </div>
            )}

            {text?.error && (
              <div className="text-sm text-red-400">
                Failed to load: {text.error}. Please check your internet connection.
              </div>
            )}

            {text && !text.error && (
              <HalachotList
                text={text}
                filteredIdx={filteredIdx}
                query={query}
                showHebrew={showHebrew}
                showEnglish={showEnglish}
                chapter={activeChapter}
                bookmarks={bookmarks}
                toggleBookmark={toggleBookmark}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HalachotList({ text, filteredIdx, query, showHebrew, showEnglish, chapter, bookmarks, toggleBookmark }) {
  const indices = filteredIdx ?? text.hebrew.map((_, i) => i);
  if (indices.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)]">
        {query ? `No halachot match "${query}".` : 'No text available for this chapter.'}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {indices.map((i) => {
        const ref = `${chapter}:${i + 1}`;
        const bookmarked = bookmarks.includes(ref);
        const he = text.hebrew[i];
        const en = text.english[i];
        return (
          <div key={i} className="pb-3 border-b border-[var(--color-border)] border-opacity-30">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-[var(--color-text-secondary)]">
                Halacha {i + 1}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleBookmark(ref); }}
                className={`text-sm ${bookmarked ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)] opacity-50 hover:opacity-100'}`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                {bookmarked ? '★' : '☆'}
              </button>
            </div>
            {showHebrew && he && (
              <div
                className="hebrew-text text-sm leading-relaxed text-[var(--color-text)] mb-2"
                dangerouslySetInnerHTML={{ __html: highlight(parseHalachaHTML(he), query) }}
              />
            )}
            {showEnglish && en && (
              <div
                className="text-xs leading-relaxed text-[var(--color-text-secondary)]"
                dangerouslySetInnerHTML={{ __html: highlight(parseHalachaHTML(en), query) }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookmarksView({ bookmarks, toggleBookmark, setActiveChapter }) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text-secondary)]">
        No bookmarks yet. Click the ☆ next to any halacha to save it.
      </div>
    );
  }
  const byChapter = {};
  for (const ref of bookmarks) {
    const [ch] = ref.split(':');
    byChapter[ch] = byChapter[ch] || [];
    byChapter[ch].push(ref);
  }
  return (
    <div className="space-y-3">
      {Object.entries(byChapter).map(([ch, refs]) => (
        <div key={ch}>
          <button
            onClick={() => setActiveChapter(parseInt(ch, 10))}
            className="text-xs font-bold text-[var(--color-accent)] hover:underline"
          >
            Chapter {ch} — {CHAPTER_TITLES[ch]?.en}
          </button>
          <ul className="mt-1 space-y-1">
            {refs.map((ref) => (
              <li key={ref} className="flex items-center justify-between text-xs">
                <span>Halacha {ref.split(':')[1]}</span>
                <button
                  onClick={() => toggleBookmark(ref)}
                  className="text-[var(--color-gold)]"
                  aria-label="Remove bookmark"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function stripHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined') return html.replace(/<[^>]+>/g, '');
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

function highlight(html, query) {
  if (!query || !query.trim() || typeof window === 'undefined') return html;
  // Simple highlight: wrap matches in <mark>. Only touches text nodes.
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  const q = query.trim();
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (re.test(child.nodeValue)) {
          re.lastIndex = 0;
          const frag = document.createRange().createContextualFragment(
            child.nodeValue.replace(re, '<mark>$1</mark>')
          );
          node.replaceChild(frag, child);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag !== 'mark' && tag !== 'script' && tag !== 'style') walk(child);
      }
    }
  };
  walk(root);
  return root.innerHTML;
}
