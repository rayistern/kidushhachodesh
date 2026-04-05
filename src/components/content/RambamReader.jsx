import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCalculationStore } from '../../stores/calculationStore';

const CHAPTERS = Array.from({ length: 9 }, (_, i) => i + 11); // chapters 11-19

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

// Cache for fetched text
const textCache = {};

async function fetchChapter(chapter) {
  if (textCache[chapter]) return textCache[chapter];

  try {
    const res = await fetch(
      `https://www.sefaria.org/api/v3/texts/Mishneh_Torah,_Sanctification_of_the_New_Month.${chapter}?version=hebrew|all&version=english|all`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Sefaria v3 returns versions array
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

export default function RambamReader() {
  const activeChapter = useUIStore((s) => s.activeChapter);
  const setActiveChapter = useUIStore((s) => s.setActiveChapter);
  const selectStep = useCalculationStore((s) => s.selectStep);

  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHebrew, setShowHebrew] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchChapter(activeChapter).then((data) => {
      setText(data);
      setLoading(false);
    });
  }, [activeChapter]);

  // Map chapter to related calculation step
  const chapterToStep = {
    12: 'sunMeanLongitude',
    13: 'sunMaslulCorrection',
    14: 'moonMeanLongitude',
    15: 'moonMaslulCorrection',
    16: 'moonLatitude',
    17: 'moonVisibility',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chapter selector */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="flex flex-wrap gap-1">
          {CHAPTERS.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChapter(ch)}
              className={`px-2 py-1 rounded text-xs font-mono ${
                activeChapter === ch
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <div className="mt-2">
          <div className="text-sm font-bold text-[var(--color-text)]">
            Chapter {activeChapter}: {CHAPTER_TITLES[activeChapter]?.en}
          </div>
          <div className="hebrew-text text-sm text-[var(--color-accent)]">
            פרק {activeChapter}: {CHAPTER_TITLES[activeChapter]?.he}
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2 mt-2">
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
          {chapterToStep[activeChapter] && (
            <button
              onClick={() => selectStep(chapterToStep[activeChapter])}
              className="px-2 py-0.5 rounded text-xs bg-[var(--color-gold)] bg-opacity-20 text-[var(--color-gold)]"
            >
              View Calculation
            </button>
          )}
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 overflow-y-auto p-3">
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
          <div className="space-y-4">
            {text.hebrew.map((he, i) => (
              <div key={i} className="pb-3 border-b border-[var(--color-border)] border-opacity-30">
                <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  Halacha {i + 1}
                </div>
                {showHebrew && he && (
                  <div
                    className="hebrew-text text-sm leading-relaxed text-[var(--color-text)] mb-2"
                    dangerouslySetInnerHTML={{ __html: he }}
                  />
                )}
                {showEnglish && text.english[i] && (
                  <div
                    className="text-xs leading-relaxed text-[var(--color-text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: text.english[i] }}
                  />
                )}
              </div>
            ))}

            {text.hebrew.length === 0 && text.english.length === 0 && (
              <div className="text-sm text-[var(--color-text-secondary)]">
                No text available for this chapter. Try reloading.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
