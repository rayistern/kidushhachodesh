/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { parseHalachaHTML } from './rambamChips';

describe('parseHalachaHTML', () => {
  it('wraps English keywords in chip buttons', () => {
    const html = '<p>The apogee is a key concept.</p>';
    const out = parseHalachaHTML(html);
    expect(out).toContain('class="kh-chip"');
    expect(out).toContain('data-chip-step="sunApogee"');
  });

  it('wraps Hebrew keywords', () => {
    const html = '<p>אמצע השמש בשעת העיבור</p>';
    const out = parseHalachaHTML(html);
    expect(out).toContain('data-chip-step="sunMeanLongitude"');
  });

  it('does not mangle attribute values', () => {
    const html = '<a href="https://example.com/apogee">link</a>';
    const out = parseHalachaHTML(html);
    // href should still be intact — we only wrap text nodes.
    expect(out).toContain('href="https://example.com/apogee"');
  });

  it('handles empty input safely', () => {
    expect(parseHalachaHTML('')).toBe('');
    expect(parseHalachaHTML(null)).toBe('');
  });
});
