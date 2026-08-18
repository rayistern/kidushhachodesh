/**
 * Sefaria text loader for Mishneh Torah, Sanctification of the New Month.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **n/a** — this is a text-transport module. It moves
 *  halacha text; it does no halachic or astronomical computation.
 *  SURFACE CATEGORY: internal lib (network I/O)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Sefaria's v3 texts API returns every available version when asked for
 * `version=<lang>|all`. Several English translations exist for this
 * text (Touger, Nataf, Birnbaum, and a community translation), and the
 * order they arrive in is not contractual — so we select the version we
 * want *by title* rather than trusting array position.
 *
 * The pinned defaults:
 *   Hebrew  — "Torat Emet 363", the vocalized (menukad) Hebrew.
 *   English — the Touger translation (Moznaim), matched on the
 *             substring "Touger" because the full version title carries
 *             publication details that Sefaria has changed before.
 *
 * If a pinned version is missing for some chapter we fall back to the
 * first version in that language rather than rendering an empty page,
 * and report which version was actually used via `heVersionTitle` /
 * `enVersionTitle` so the UI can be honest about what it is showing.
 *
 * Responses are cached per chapter for the lifetime of the page. The
 * text is fixed and public, so there is nothing to invalidate.
 */

const API_ROOT = 'https://www.sefaria.org/api/v3/texts';
const TITLE = 'Mishneh_Torah,_Sanctification_of_the_New_Month';

/** Substring matched against Sefaria's `versionTitle` for each language. */
export const PREFERRED_HEBREW = 'Torat Emet';
export const PREFERRED_ENGLISH = 'Touger';

const cache = new Map();

function pickVersion(versions, language, preferred) {
  const inLanguage = versions.filter((v) => v.language === language);
  if (inLanguage.length === 0) return null;
  return inLanguage.find((v) => (v.versionTitle || '').includes(preferred)) || inLanguage[0];
}

function asArray(text) {
  if (!text) return [];
  return Array.isArray(text) ? text : [text];
}

/**
 * Fetch one chapter of Hilchot Kidush HaChodesh.
 *
 * Resolves to `{ chapter, hebrew, english, heVersionTitle,
 * enVersionTitle }` on success, or the same shape with `error` set and
 * empty text arrays on failure — it never rejects, so callers can
 * render an error state without a try/catch at every call site.
 */
export async function fetchChapter(chapter, { signal } = {}) {
  if (cache.has(chapter)) return cache.get(chapter);

  const url = `${API_ROOT}/${TITLE}.${chapter}?version=hebrew|all&version=english|all`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Sefaria responded ${res.status}`);
    const data = await res.json();

    // Sefaria reports out-of-range chapters as a 200 with an `error` key.
    if (data.error) throw new Error(data.error);

    const versions = Array.isArray(data.versions) ? data.versions : [];
    const he = pickVersion(versions, 'he', PREFERRED_HEBREW);
    const en = pickVersion(versions, 'en', PREFERRED_ENGLISH);

    const result = {
      chapter,
      hebrew: asArray(he?.text),
      english: asArray(en?.text),
      heVersionTitle: he?.versionTitle || null,
      enVersionTitle: en?.versionTitle || null,
    };

    cache.set(chapter, result);
    return result;
  } catch (err) {
    // An aborted fetch is a navigation, not a failure — don't cache it
    // and don't surface it as an error the user needs to see.
    if (err?.name === 'AbortError') throw err;
    console.error(`Sefaria fetch failed for chapter ${chapter}:`, err);
    return {
      chapter,
      hebrew: [],
      english: [],
      heVersionTitle: null,
      enVersionTitle: null,
      error: err.message,
    };
  }
}

/** Drop cached chapters. Exposed for tests; the app never needs it. */
export function clearChapterCache() {
  cache.clear();
}
