/**
 * Paragraph structure inside a halacha.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal lib (text presentation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * A single halacha can be very long — KH 12:2 is one halacha of some
 * eight thousand characters, and KH 17 has one with eighteen internal
 * breaks. The Touger translation marks its paragraph divisions with
 * `<br>` tags, which render as a bare line break and leave the halacha
 * looking like an undivided wall of prose.
 *
 * `splitParagraphs` recovers those divisions so each can be rendered as
 * a real paragraph with space around it. The divisions are the
 * translation's own; nothing here invents a break that is not marked in
 * the source.
 *
 * Neither Hebrew edition Sefaria serves for this text (Torat Emet or
 * Wikisource) contains any break markers at all — a Hebrew halacha
 * arrives as one continuous block, which is how it is set in print.
 * Such a block comes back as a single paragraph rather than being
 * segmented on sentence-final periods: where Touger divides his English
 * is a fact about his translation, and guessing at the corresponding
 * points in the Hebrew would be fabricating structure and presenting it
 * as the text's own.
 */

/** Matches one or more <br> tags and any whitespace between them. */
const BREAK_RUN = /(?:<br\s*\/?>\s*)+/gi;

/**
 * Split halacha HTML into paragraph-level chunks.
 *
 * Always returns at least one entry for non-empty input, so callers can
 * map over the result without a special case for unbroken text.
 */
export function splitParagraphs(html) {
  if (!html) return [];
  const parts = html
    .split(BREAK_RUN)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && stripsToText(s));
  return parts.length > 0 ? parts : [html];
}

/**
 * True when a chunk holds something other than markup — a trailing
 * `<br>` can otherwise yield a fragment that renders as an empty
 * paragraph and opens a gap in the text.
 */
function stripsToText(chunk) {
  return chunk.replace(/<[^>]+>/g, '').trim().length > 0;
}
