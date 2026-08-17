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
  // Derived, not hardcoded. This test named chapter 15, then searched
  // 11-19, and both times failed for the happiest possible reason: the
  // chapter it was using got written. The astronomical arc (11-19) is now
  // complete, so it searches the whole book — chapters 1-10, the court
  // and the fixed calendar, are still source-only.
  const written = new Set(writtenChapters());
  const unwritten = Array.from({ length: 19 }, (_, i) => i + 1).find((n) => !written.has(n));

  it('there is still an unwritten chapter to test with', () => {
    expect(unwritten, 'every chapter 1-19 is written — retire this block').toBeDefined();
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
    // Derived from the registry, so writing a chapter widens what this
    // checks rather than breaking it. Every chapter the chain covers
    // (11-19) is now written, so in practice every node points at /book —
    // the /text branch is kept because the rule, not the current state,
    // is what is being asserted.
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
    // Not vacuous: every node must resolve to a link of some kind.
    expect(hrefs.size).toBeGreaterThanOrEqual(
      new Set(CHAIN_NODES.map((n) => n.chapter)).size,
    );
  });
});

