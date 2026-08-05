/**
 * The three pathname-parsing functions (/engine, /docs, /templates) must
 * work through BOTH the direct Netlify paths and the /kh proxy alias.
 *
 * Netlify's status-200 rewrites keep the ORIGINAL request URL, so through
 * the Vercel proxy these functions receive /kh/... pathnames. From launch
 * until 2026-08-05 they only stripped the bare prefix, so every proxied
 * request 404'd — the whole "read the docs / import the engine / fetch a
 * template" surface was dead on the public URL. These tests pin the strip
 * logic for both shapes plus the traversal guards.
 */
import { describe, it, expect } from 'vitest';
import engineFn from '../engine.mjs';
import docFn from '../doc.mjs';
import templatesFn from '../templates.mjs';

const hit = (fn, p) => fn(new Request(`https://x.example${p}`));

describe('/engine — direct and /kh-proxied', () => {
  it.each([
    ['/engine', 200],
    ['/engine/', 200],
    ['/engine/index.json', 200],
    ['/engine/pipeline.js', 200],
    ['/engine/periodBlocks.js', 200],
    ['/engine/fixedCalendar/index.js', 200],
    ['/kh/engine', 200],
    ['/kh/engine/pipeline.js', 200],
    ['/kh/engine/fixedCalendar/index.js', 200],
    ['/kh/engine/nope.js', 404],
  ])('%s → %i', async (p, status) => {
    expect((await hit(engineFn, p)).status).toBe(status);
  });
});

describe('/docs — direct and /kh-proxied, subpaths, traversal', () => {
  it.each([
    ['/docs/ROADMAP.md', 200],
    ['/kh/docs/ROADMAP.md', 200],
    ['/docs/sources/KH_15_verbatim.md', 200],
    ['/kh/docs/sources/KH_15_verbatim.md', 200],
    ['/docs/../package.json', 404],
    ['/kh/docs/nope.md', 404],
  ])('%s → %i', async (p, status) => {
    expect((await hit(docFn, p)).status).toBe(status);
  });
});

describe('/templates — direct and /kh-proxied', () => {
  it.each([
    ['/templates', 200],
    ['/kh/templates', 200],
    ['/templates/node-cli.mjs', 200],
    ['/kh/templates/node-cli.mjs', 200],
    ['/kh/templates/nope.txt', 404],
  ])('%s → %i', async (p, status) => {
    expect((await hit(templatesFn, p)).status).toBe(status);
  });
});
