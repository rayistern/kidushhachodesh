// @vitest-environment jsdom
/**
 * Smoke tests for the full-text reader (`/text`, `/text/:chapter`).
 *
 * The Sefaria fetch is stubbed — these assert our rendering and routing
 * behaviour, not Sefaria's uptime. What they pin down:
 *
 *  - the index links to all 19 chapters, both regimes;
 *  - a chapter page renders the Hebrew and the Touger English text;
 *  - the Touger version is chosen by *title*, not by position in the
 *    response, which is the one thing about the API we cannot assume;
 *  - an out-of-range chapter redirects instead of rendering an empty
 *    page or crashing on `CHAPTER_TITLES[undefined]`.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TextIndex from './TextIndex';
import TextChapter from './TextChapter';
import { clearChapterCache } from '../../lib/sefaria';

// Deliberately lists Touger *second* so a naive "first English version"
// pick would fail this test.
const VERSIONS = [
  {
    language: 'en',
    versionTitle: 'Sefaria Edition. Translated by R. Francis Nataf, 2019',
    text: ['NATAF ONE', 'NATAF TWO'],
  },
  {
    language: 'en',
    versionTitle: 'Mishneh Torah, trans. by Eliyahu Touger. Jerusalem, Moznaim Pub. c1986-c2007',
    text: ['TOUGER ONE<sup class="footnote-marker">1</sup><i class="footnote">A note.</i>', 'TOUGER TWO'],
  },
  { language: 'he', versionTitle: 'Wikisource Mishneh Torah', text: ['ויקי אחד', 'ויקי שתיים'] },
  { language: 'he', versionTitle: 'Torat Emet 363', text: ['עִבְרִית אַחַת', 'עִבְרִית שְׁתַּיִם'] },
];

function renderChapter(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/text" element={<TextIndex />} />
        <Route path="/text/:chapter" element={<TextChapter />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  clearChapterCache();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ versions: VERSIONS }) })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TextIndex', () => {
  it('links to every chapter of Hilchot Kidush HaChodesh', () => {
    render(
      <MemoryRouter initialEntries={['/text']}>
        <TextIndex />
      </MemoryRouter>,
    );
    for (let ch = 1; ch <= 19; ch++) {
      const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
      expect(links).toContain(`/text/${ch}`);
    }
  });
});

describe('TextChapter', () => {
  it('renders Hebrew and the Touger English side by side', async () => {
    renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText('TOUGER ONE', { exact: false })).toBeTruthy());
    expect(screen.getByText('עִבְרִית אַחַת')).toBeTruthy();
    // The runner-up English translation must not leak into the page.
    expect(screen.queryByText('NATAF ONE')).toBeNull();
  });

  it('names the versions it actually rendered', async () => {
    renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText(/Torat Emet 363/)).toBeTruthy());
    expect(screen.getByText(/Touger/)).toBeTruthy();
  });

  it('redirects an out-of-range chapter to the index', async () => {
    renderChapter('/text/20');
    await waitFor(() =>
      expect(screen.getByText(/Hilchot Kidush HaChodesh, all 19 chapters/)).toBeTruthy(),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
