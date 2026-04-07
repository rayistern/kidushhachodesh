// Shared helpers for the Kiddush HaChodesh HTTP API + MCP server.
//
// Search / fetch operate over the unified corpus in `_corpus.mjs`.
// Calculation runs the live engine in `src/engine/`.
// Source / template listing is read-only browsing of bundled files.
//
// Add new content sources in `_corpus.mjs`, not here.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getFullCalculation } from '../../src/engine/pipeline.js';
import { loadCorpus, corpusStats } from './_corpus.mjs';

const ROOT = process.cwd();
const ENGINE_DIR = path.resolve(ROOT, 'src/engine');
const TEMPLATES_DIR = path.resolve(ROOT, 'templates');
const DOCS_DIR = path.resolve(ROOT, 'docs');

// ─── Search ───────────────────────────────────────────────────
// Tiny substring-scoring search. Good enough for a small corpus;
// easy to swap for lunr/minisearch later without touching callers.
export function searchCorpus(query, opts = {}) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const typeFilter = opts.type; // optional: 'step' | 'doc' | 'class' | ...
  const scored = [];

  for (const entry of loadCorpus()) {
    if (typeFilter && entry.type !== typeFilter) continue;
    const hay = (
      entry.title +
      ' ' +
      (entry.hebrewTitle || '') +
      ' ' +
      (entry.tags || []).join(' ') +
      '\n' +
      entry.body
    ).toLowerCase();

    let score = 0;
    for (const t of terms) {
      // Weight title hits higher than body hits.
      const titleHits = (entry.title.toLowerCase().match(new RegExp(escapeRe(t), 'g')) || []).length;
      score += titleHits * 10;
      let idx = 0;
      while ((idx = hay.indexOf(t, idx)) !== -1) {
        score += 1;
        idx += t.length;
      }
    }
    if (score === 0) continue;

    // Snippet around first match
    const body = entry.body || '';
    const firstIdx = body.toLowerCase().indexOf(terms[0]);
    const start = Math.max(0, firstIdx - 90);
    const snippet = body
      .slice(start, start + 260)
      .replace(/\s+/g, ' ')
      .trim();

    scored.push({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      hebrewTitle: entry.hebrewTitle,
      rambamRef: entry.rambamRef,
      url: entry.url,
      snippet,
      score,
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.limit || 20);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Fetch by id ──────────────────────────────────────────────
export function fetchById(id) {
  if (!id) return null;
  const hit = loadCorpus().find((e) => e.id === id);
  if (!hit) return null;
  return {
    id: hit.id,
    type: hit.type,
    title: hit.title,
    hebrewTitle: hit.hebrewTitle,
    rambamRef: hit.rambamRef,
    url: hit.url,
    attribution: hit.attribution,
    tags: hit.tags,
    content: hit.body,
  };
}

// ─── Run the Rambam pipeline for a date ───────────────────────
export function runCalculation(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('date must be YYYY-MM-DD (Gregorian)');
  }
  const d = new Date(dateStr + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error('invalid date');
  const calc = getFullCalculation(d);
  return {
    date: dateStr,
    daysFromEpoch: calc.daysFromEpoch,
    sun: calc.sun,
    moon: calc.moon,
    season: calc.season,
    steps: calc.steps.map((s) => ({
      id: s.id,
      name: s.name,
      hebrewName: s.hebrewName,
      rambamRef: s.rambamRef,
      formula: s.formula,
      result: s.result,
      unit: s.unit,
      sourceNote: s.sourceNote,
      teachingNote: s.teachingNote,
    })),
  };
}

// ─── Source browsing (read-only, whitelisted) ─────────────────
// Exposes the engine source and the docs under stable URLs so AI
// assistants can read and fork them. Not the templates — those
// live at /templates/ and have their own endpoint.
const SOURCE_WHITELIST = {
  engine: {
    dir: ENGINE_DIR,
    files: [
      'pipeline.js',
      'sunCalculations.js',
      'moonCalculations.js',
      'visibilityCalculations.js',
      'constants.js',
      'dmsUtils.js',
    ],
  },
  docs: {
    dir: DOCS_DIR,
    files: null, // null = list whatever is there
  },
};

export function listSource(area) {
  if (!area) {
    return {
      areas: Object.keys(SOURCE_WHITELIST).map((k) => ({
        name: k,
        url: `/api/source?area=${k}`,
      })),
    };
  }
  const w = SOURCE_WHITELIST[area];
  if (!w) return null;
  const files = w.files || readdirSync(w.dir);
  return {
    area,
    files: files.map((f) => ({
      name: f,
      url: `/api/source?area=${area}&file=${f}`,
      liveUrl: area === 'engine' ? `/engine/${f}` : `/docs/${f}`,
      githubUrl: `https://github.com/rayistern/kidushhachodesh/blob/main/${
        area === 'engine' ? 'src/engine' : 'docs'
      }/${f}`,
    })),
  };
}

export function getSource(area, file) {
  const w = SOURCE_WHITELIST[area];
  if (!w) return null;
  if (w.files && !w.files.includes(file)) return null;
  if (file.includes('..') || file.includes('/')) return null;
  try {
    const body = readFileSync(path.join(w.dir, file), 'utf8');
    return { area, file, content: body };
  } catch {
    return null;
  }
}

// ─── Template browsing ────────────────────────────────────────
export function listTemplates() {
  const files = readdirSync(TEMPLATES_DIR).filter(
    (f) => !f.startsWith('.') && f !== 'README.md'
  );
  return files.map((f) => ({
    name: f,
    url: `/templates/${f}`,
    kind: path.extname(f).slice(1),
  }));
}

export function getTemplate(name) {
  if (!name || name.includes('..') || name.includes('/')) return null;
  try {
    return readFileSync(path.join(TEMPLATES_DIR, name), 'utf8');
  } catch {
    return null;
  }
}

// ─── Corpus stats (useful for /api and index endpoints) ───────
export { corpusStats };

// ─── Response helper ──────────────────────────────────────────
export function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      ...extraHeaders,
    },
  });
}
