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
import ch11 from './ch11';
import ch12 from './ch12';
import ch13 from './ch13';
import ch14 from './ch14';
import ch15 from './ch15';
import ch16 from './ch16';
import ch17 from './ch17';
import ch18 from './ch18';
import ch19 from './ch19';

export const BOOK_CHAPTERS = {
  11: ch11,
  12: ch12,
  13: ch13,
  14: ch14,
  15: ch15,
  16: ch16,
  17: ch17,
  18: ch18,
  19: ch19,
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
