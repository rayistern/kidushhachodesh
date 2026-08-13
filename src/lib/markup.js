/**
 * The tiny subset of markdown the editorial content modules are written in.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal lib (text presentation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * `**bold**` and `*italic*`, and nothing else. Extracted from
 * TextChapter.jsx when the book surface needed the same rendering for
 * its prose, so the two cannot drift into different dialects.
 *
 * The input is escaped before any markup is applied. Every caller today
 * passes strings authored inside this repo, but these are content files
 * and content files get edited — the escaping means a stray angle
 * bracket in a sentence renders as an angle bracket rather than opening
 * an injection point.
 */
export function renderEmphasis(source) {
  return String(source ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--color-text)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
