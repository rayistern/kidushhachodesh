/**
 * Registry of written book chapters.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: teaching commentary (composition)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Adding a chapter is: write `chNN.js`, add one line here. Routing, the
 * chain map, the cross-links from `/text`, and the structural tests all
 * pick it up without further change — `book.test.js` iterates this
 * object, so a new chapter is validated the moment it is registered.
 *
 * Chapters that are not keys here are not yet written. That is a normal
 * state, not an error: the book grows a chapter at a time while the
 * map keeps showing the whole arc, and the reader is sent to the source
 * text for anything still unwritten.
 */
import ch14 from './ch14';

export const BOOK_CHAPTERS = {
  14: ch14,
};

/** The chapter's content, or null if it has not been written yet. */
export function bookChapter(chapter) {
  return BOOK_CHAPTERS[chapter] || null;
}

/** True when a plain-language chapter exists for this number. */
export function hasBookChapter(chapter) {
  return Boolean(BOOK_CHAPTERS[chapter]);
}

/** Written chapter numbers, ascending. */
export function writtenChapters() {
  return Object.keys(BOOK_CHAPTERS)
    .map(Number)
    .sort((a, b) => a - b);
}
