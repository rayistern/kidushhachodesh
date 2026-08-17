// @vitest-environment jsdom
/**
 * The book's rendering guarantees.
 *
 * Two of these matter more than the rest:
 *
 *  - the attribution strip. The whole page is editorial prose about a
 *    religious text, so it must always say so.
 *  - the season-correction disclosure. `/text/14` shows Touger's "30
 *    minutes" and the engine computes with 15. A reader who meets that
 *    unannounced has found what looks like a bug in our arithmetic. The
 *    card must name both readings, and must not swap which is which.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookChapter from './BookChapter';
import BookIndex from './BookIndex';
import ChainMap from './ChainMap';
import { CHAIN_NODES } from '../../content/book/chain';
import { writtenChapters } from '../../content/book';

afterEach(cleanup);

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <React.Suspense fallback={<div>loading</div>}>
        <Routes>
          <Route path="/book" element={<BookIndex />} />
          <Route path="/book/:chapter" element={<BookChapter />} />
        </Routes>
      </React.Suspense>
    </MemoryRouter>,
  );
}

describe('a written chapter', () => {
  it('renders the recap, every section heading, and the closing', async () => {
    renderAt('/book/14');
    await waitFor(() => expect(screen.getByText(/Where we've got to/)).toBeTruthy());
    expect(screen.getByText('Why the moon is harder than the sun')).toBeTruthy();
    expect(screen.getByText('The small circle riding on the big one')).toBeTruthy();
    expect(screen.getByText('Two speeds that look almost the same')).toBeTruthy();
    expect(screen.getByText(/What you have now/)).toBeTruthy();
  });

  it('always says it is not the Rambam', () => {
    renderAt('/book/14');
    expect(screen.getByText(/not the Rambam/)).toBeTruthy();
  });

  it('links to the source chapter, and deep-links individual halachot', () => {
    const { container } = renderAt('/book/14');
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/text/14');
    expect(hrefs.some((h) => h?.includes('/text/14#halacha-'))).toBe(true);
  });
});

describe('chapters that are not written yet', () => {
  // Derived, not hardcoded — this test named chapter 15 until chapter 15
  // was written, at which point it failed for the happiest possible
  // reason. It now finds whichever astronomical chapter is next.
  const written = new Set(writtenChapters());
  const unwritten = [11, 12, 13, 14, 15, 16, 17, 18, 19].find((n) => !written.has(n));

  it('there is still an unwritten chapter to test with', () => {
    expect(unwritten, 'the whole book is written — retire this describe block').toBeDefined();
  });

  it('sends the reader to the source instead of failing', async () => {
    const { container } = renderAt(`/book/${unwritten}`);
    await waitFor(() => expect(screen.getByText(/not written yet/)).toBeTruthy());
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain(`/text/${unwritten}`);
  });

  it('redirects a chapter number that does not exist', async () => {
    renderAt('/book/99');
    await waitFor(() =>
      expect(screen.getByText(/Kiddush HaChodesh, in plain words/)).toBeTruthy(),
    );
  });
});

describe('the chain map', () => {
  function renderMap(currentChapter, activeNodeId) {
    return render(
      <MemoryRouter>
        <ChainMap currentChapter={currentChapter} activeNodeId={activeNodeId} />
      </MemoryRouter>,
    );
  }

  it('shows every step of the calculation', () => {
    renderMap(14);
    for (const node of CHAIN_NODES) {
      // Rendered twice — the mobile sheet and the desktop rail.
      expect(screen.getAllByText(node.label).length, node.id).toBeGreaterThan(0);
    }
  });

  it('names the three states in words, not just colours', () => {
    renderMap(14);
    expect(screen.getAllByText('Already covered').length).toBeGreaterThan(0);
    expect(screen.getAllByText('You are here').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Still to come').length).toBeGreaterThan(0);
  });

  it('marks the current chapter for assistive technology', () => {
    const { container } = renderMap(14);
    const current = container.querySelectorAll('[aria-current="step"]');
    // The three chapter-14 nodes.
    expect(current.length).toBeGreaterThanOrEqual(3);
  });

  it('routes written chapters to the book and unwritten ones to the source', () => {
    // Derived from the registry rather than hardcoded, so writing a new
    // chapter does not break this test — it just widens what it checks.
    const { container } = renderMap(14);
    const hrefs = new Set(
      Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href')),
    );
    const written = new Set(writtenChapters());

    for (const node of CHAIN_NODES) {
      const expected = written.has(node.chapter)
        ? `/book/${node.chapter}`
        : `/text/${node.chapter}`;
      expect(hrefs, `chapter ${node.chapter}`).toContain(expected);
    }
    // And the two kinds must both be represented, or the test is vacuous.
    expect(written.size).toBeGreaterThan(0);
    expect(CHAIN_NODES.some((n) => !written.has(n.chapter))).toBe(true);
  });
});

describe('the season-correction disclosure', () => {
  it('names both readings and attributes each to the right source', async () => {
    renderAt('/book/14');
    await waitFor(() => expect(screen.getByText(/The nudge, by where the sun is/)).toBeTruthy());

    // getByText returns the heading element itself, so step out to the
    // panel that holds the heading and its paragraphs.
    const disclosure = screen.getByText(/One row of this table is disputed/);
    const text = disclosure.parentElement.textContent;

    // Touger's translation is the one with 30; the site computes with 15.
    // Swapping these would be a plausible-sounding, entirely wrong claim.
    expect(text).toMatch(/says\s+30 minutes/);
    expect(text).toMatch(/This site computes with\s+15/);
    expect(text).toMatch(/not a bug/);
  });

  it('flags the disputed band on the calculator itself', async () => {
    renderAt('/book/14');
    await waitFor(() => expect(screen.getByText(/The nudge, by where the sun is/)).toBeTruthy());
    // The slider opens at 90°, inside the disputed 60-120° band.
    const slider = screen.getByLabelText("The sun's position in degrees");
    expect(slider.value).toBe('90');
    expect(screen.getByText(/but Touger's text says/)).toBeTruthy();

    // Move outside the disputed band; the warning goes away.
    fireEvent.change(slider, { target: { value: '200' } });
    await waitFor(() => expect(screen.queryByText(/but Touger's text says/)).toBeNull());
  });
});
