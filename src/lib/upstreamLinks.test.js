import { describe, it, expect } from 'vitest';
import { buildLinks } from './upstreamLinks';

describe('upstream links', () => {
  it('with no base, everything is an internal route', () => {
    const l = buildLinks(undefined);
    expect(l.external).toBe(false);
    expect(l.dashboard).toBe('/');
    expect(l.text()).toBe('/text');
    expect(l.text(14)).toBe('/text/14');
  });

  it("with the Netlify base, everything points at rayi's deployment", () => {
    const l = buildLinks('https://www.shluchimexchange.ai/kh/');
    expect(l.external).toBe(true);
    expect(l.dashboard).toBe('https://www.shluchimexchange.ai/kh/');
    expect(l.text()).toBe('https://www.shluchimexchange.ai/kh/text');
    expect(l.text(14)).toBe('https://www.shluchimexchange.ai/kh/text/14');
  });
});
