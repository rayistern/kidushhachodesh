import { describe, it, expect } from 'vitest';
import { splitParagraphs } from './rambamText';

describe('splitParagraphs', () => {
  it("recovers the translation's paragraph divisions", () => {
    expect(splitParagraphs('One.<br>Two.<br>Three.')).toEqual(['One.', 'Two.', 'Three.']);
  });

  it('treats a run of breaks as a single division', () => {
    expect(splitParagraphs('One.<br><br/>  <br />Two.')).toEqual(['One.', 'Two.']);
  });

  it('accepts the tag in any of the forms Sefaria serves', () => {
    expect(splitParagraphs('a<br>b<br/>c<br />d<BR>e')).toHaveLength(5);
  });

  it('returns unbroken text as one paragraph', () => {
    // Every Hebrew edition of this text arrives without break markers.
    const hebrew = 'נְקֻדָּה אַחַת יֵשׁ בְּגַלְגַּל הַשֶּׁמֶשׁ. וְכֵן בִּשְׁאָר גַּלְגַּלֵּי הַשִּׁבְעָה כּוֹכָבִים.';
    expect(splitParagraphs(hebrew)).toEqual([hebrew]);
  });

  it('does not segment on sentence-final periods', () => {
    // Guards against "helpfully" inventing Hebrew paragraph structure:
    // 57 sentences in KH 12:2 must not become 57 paragraphs.
    expect(splitParagraphs('One. Two. Three.')).toHaveLength(1);
  });

  it('drops a trailing break instead of emitting an empty paragraph', () => {
    expect(splitParagraphs('Only one.<br>')).toEqual(['Only one.']);
    expect(splitParagraphs('Only one.<br>   <br>')).toEqual(['Only one.']);
  });

  it('keeps markup-only chunks out of the result', () => {
    // A chunk holding nothing but a footnote tag pair would render as a
    // visible gap once footnotes are hidden.
    expect(splitParagraphs('Text.<br><i class="footnote"></i>')).toEqual(['Text.']);
  });

  it('preserves inline markup within a paragraph', () => {
    const [first] = splitParagraphs('As stated<sup class="footnote-marker">1</sup><i class="footnote">A note.</i> above.<br>Next.');
    expect(first).toContain('footnote-marker');
    expect(first).toContain('A note.');
  });

  it('handles empty and missing input', () => {
    expect(splitParagraphs('')).toEqual([]);
    expect(splitParagraphs(undefined)).toEqual([]);
    expect(splitParagraphs(null)).toEqual([]);
  });
});
