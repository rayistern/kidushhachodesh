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
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
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
    text: [
      'TOUGER ONE<sup class="footnote-marker">1</sup><i class="footnote">A note.</i><br>SECOND PARA<br>THIRD PARA',
      'TOUGER TWO',
    ],
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

  it("breaks a halacha at the translation's own paragraph divisions", async () => {
    const { container } = renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText('SECOND PARA')).toBeTruthy());
    expect(screen.getByText('THIRD PARA')).toBeTruthy();

    // Halacha 1's English has two <br> marks, so three paragraphs; the
    // Hebrew has none, so exactly one.
    const halacha = container.querySelector('#halacha-1');
    const columns = halacha.querySelectorAll('.kh-halacha');
    expect(columns).toHaveLength(2);
    const paragraphCounts = Array.from(columns).map((c) => c.querySelectorAll('p').length);
    expect(paragraphCounts.sort()).toEqual([1, 3]);
  });

  it('names the versions it actually rendered', async () => {
    renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText(/Torat Emet 363/)).toBeTruthy());
    expect(screen.getByText(/Touger/)).toBeTruthy();
  });

  it('mounts the chapter-11 interactives, and only on chapter 11', async () => {
    // Chapter 11 carries the KH 11:7-17 teaching cards.
    const { unmount } = renderChapter('/text/11');
    await waitFor(() =>
      expect(screen.getByText(/Where in the zodiac is this longitude/)).toBeTruthy(),
    );
    expect(screen.getByText(/Add and subtract in degrees/)).toBeTruthy();
    expect(screen.getByText(/Uniform motion, uneven appearance/)).toBeTruthy();
    expect(screen.getByText(/How many days since the starting point/)).toBeTruthy();
    expect(screen.getByText(/band of latitude/)).toBeTruthy();
    unmount();

    // Chapter 1 has none registered, so the reader stays plain text.
    renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText('TOUGER ONE', { exact: false })).toBeTruthy());
    expect(screen.queryByText(/Where in the zodiac is this longitude/)).toBeNull();
  });

  it('keeps a card whose halacha runs past the served text', async () => {
    // The stub serves 2 halachot; every chapter-11 card is registered
    // after halacha 9 or later. They must still render.
    renderChapter('/text/11');
    await waitFor(() =>
      expect(screen.getByText(/Where in the zodiac is this longitude/)).toBeTruthy(),
    );
  });

  it("shows the Rambam's own KH 11:12 answer once the calculator is opened", async () => {
    // The card is collapsed by default, so this also proves the toggle
    // works — and that the arithmetic in lib/sexagesimal reaches the DOM
    // rather than only passing its own unit tests.
    renderChapter('/text/11');
    const heading = await screen.findByText(/Add and subtract in degrees/);
    fireEvent.click(heading.closest('button'));
    await waitFor(() => expect(screen.getByText(`259° 29' 50"`)).toBeTruthy());
    expect(screen.getByText(/This is the answer stated in KH 11:12/)).toBeTruthy();
  });

  it('mounts the chapter-12 cards and shows the KH 12:2 result', async () => {
    renderChapter('/text/12');
    const heading = await screen.findByText(/Where is the sun, on average/);
    expect(screen.getByText(/Why the daily motion is/)).toBeTruthy();
    expect(screen.getByText(/The apogee, and how slowly it moves/)).toBeTruthy();

    fireEvent.click(heading.closest('button'));
    // The card defaults to the Rambam's own 100-day example.
    await waitFor(() => expect(screen.getByText(`105° 37′ 25.0″`)).toBeTruthy());
    expect(screen.getByText(/KH 12:2 states this result/)).toBeTruthy();
  });

  it("shows the monthly motion KH 12:1 states outright when N is 29", async () => {
    renderChapter('/text/12');
    const heading = await screen.findByText(/Where is the sun, on average/);
    fireEvent.click(heading.closest('button'));

    const input = await screen.findByDisplayValue('100');
    fireEvent.change(input, { target: { value: '29' } });

    // 28° 35' 1" is the figure the chapter states for one month; it must
    // appear as the motion subtotal, next to his published block, and
    // not only be folded silently into the final position.
    await waitFor(() => expect(screen.getAllByText(`28° 35′ 1.0″`).length).toBe(2));
    expect(screen.getByText(/KH 12:1 publishes one month \(29 days\) directly/)).toBeTruthy();
    // And the result is the one KH 15:8 states.
    expect(screen.getByText(`35° 38′ 33.0″`)).toBeTruthy();
    expect(screen.getByText(/KH 15:8 states this result/)).toBeTruthy();
  });

  it('walks the KH 13:9-10 chain to the result the text states', async () => {
    renderChapter('/text/13');
    const heading = await screen.findByText(/The true position of the sun/);
    expect(screen.getByText(/The correction table, drawn/)).toBeTruthy();

    fireEvent.click(heading.closest('button'));

    // Each intermediate the Rambam prints must appear, not just the
    // answer — the chapter is teaching the procedure.
    await waitFor(() => expect(screen.getByText(`105° 37′ 25.0″`)).toBeTruthy());
    expect(screen.getByText(`86° 45′ 23.0″`)).toBeTruthy();
    expect(screen.getByText(`18° 52′ 2.0″`)).toBeTruthy();
    // The result appears three times by design: the last step of the
    // chain, the summary box, and the "where was it actually" panel.
    expect(screen.getAllByText(`104° 59′ 25.0″`)).toHaveLength(3);
    expect(screen.getByText(/KH 13:10 states this result/)).toBeTruthy();
    // And it is located in the constellation the text names.
    expect(screen.getByText(/Sartan/)).toBeTruthy();
    // The modern comparison is present and reports a real gap, so the
    // reader is never left assuming the model is exact.
    expect(screen.getByText(/And where was the sun actually/)).toBeTruthy();
    expect(screen.getByText(/places his longitudes in the tropical frame/)).toBeTruthy();
  });

  it('labels every plain-language note as an editorial addition', async () => {
    // Plain English sitting directly under a halacha, unlabelled, reads
    // as though the Rambam wrote it. The attribution appears on each
    // note rather than once per page, so a deep link or a scrolled
    // viewport can never show one without it.
    renderChapter('/text/13');
    await waitFor(() => expect(screen.getAllByText(/In plain words/).length).toBeGreaterThan(0));

    const notes = document.querySelectorAll('aside');
    expect(notes.length).toBeGreaterThan(0);
    for (const note of notes) {
      expect(note.textContent).toMatch(/editor's note, not the Rambam/);
    }
  });

  it('can turn the plain-language notes off', async () => {
    renderChapter('/text/13');
    const toggle = await screen.findByRole('button', { name: 'In plain words' });
    expect(document.querySelectorAll('aside').length).toBeGreaterThan(0);

    fireEvent.click(toggle);
    await waitFor(() => expect(document.querySelectorAll('aside').length).toBe(0));
  });

  it('offers the plain-words toggle only where notes exist', async () => {
    const { unmount } = renderChapter('/text/13');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'In plain words' })).toBeTruthy(),
    );
    unmount();

    renderChapter('/text/1');
    await waitFor(() => expect(screen.getByText('TOUGER ONE', { exact: false })).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'In plain words' })).toBeNull();
  });

  it('redirects an out-of-range chapter to the index', async () => {
    renderChapter('/text/20');
    await waitFor(() =>
      expect(screen.getByText(/Hilchot Kidush HaChodesh, all 19 chapters/)).toBeTruthy(),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
