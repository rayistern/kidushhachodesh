// Shared helpers for the Kiddush HaChodesh API / MCP functions.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getFullCalculation } from '../../src/engine/pipeline.js';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

let _docsCache = null;
export function loadDocs() {
  if (_docsCache) return _docsCache;
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
  _docsCache = files.map((file) => {
    const body = readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const titleMatch = body.match(/^#\s+(.+)$/m);
    return {
      id: `doc:${file}`,
      file,
      title: titleMatch ? titleMatch[1] : file,
      url: `/docs/${file}`,
      body,
    };
  });
  return _docsCache;
}

let _stepsCache = null;
export function loadStepMetadata() {
  if (_stepsCache) return _stepsCache;
  // Run the pipeline once on a reference date to harvest step metadata
  // (ids, names, Rambam refs, formulas, sourceNotes). The numeric results
  // are date-specific and ignored here.
  const ref = getFullCalculation(new Date('2024-01-01T00:00:00Z'));
  _stepsCache = ref.steps.map((s) => ({
    id: `step:${s.id}`,
    stepId: s.id,
    title: s.name + (s.hebrewName ? ` (${s.hebrewName})` : ''),
    url: `/api/calculate?date=YYYY-MM-DD#${s.id}`,
    body: [
      s.name,
      s.hebrewName,
      s.rambamRef && `Rambam: ${s.rambamRef}`,
      s.formula && `Formula: ${s.formula}`,
      s.sourceNote,
      s.teachingNote,
    ]
      .filter(Boolean)
      .join('\n'),
  }));
  return _stepsCache;
}

export function searchCorpus(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const items = [...loadDocs(), ...loadStepMetadata()];
  const scored = [];
  for (const item of items) {
    const hay = (item.title + '\n' + item.body).toLowerCase();
    let score = 0;
    for (const t of terms) {
      let idx = 0;
      while ((idx = hay.indexOf(t, idx)) !== -1) {
        score += hay.slice(Math.max(0, idx - 1), idx).match(/\W|^/) ? 2 : 1;
        idx += t.length;
      }
    }
    if (score > 0) {
      // Build a snippet around the first match
      const firstIdx = hay.indexOf(terms[0]);
      const start = Math.max(0, firstIdx - 80);
      const snippet = (item.body || '')
        .slice(start, start + 240)
        .replace(/\s+/g, ' ')
        .trim();
      scored.push({
        id: item.id,
        title: item.title,
        url: item.url,
        snippet,
        score,
      });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20);
}

export function fetchById(id) {
  if (!id) return null;
  if (id.startsWith('doc:')) {
    const doc = loadDocs().find((d) => d.id === id);
    return doc ? { id: doc.id, title: doc.title, url: doc.url, content: doc.body } : null;
  }
  if (id.startsWith('step:')) {
    const step = loadStepMetadata().find((s) => s.id === id);
    return step ? { id: step.id, title: step.title, url: step.url, content: step.body } : null;
  }
  return null;
}

export function runCalculation(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('date must be YYYY-MM-DD (Gregorian)');
  }
  const d = new Date(dateStr + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error('invalid date');
  const calc = getFullCalculation(d);
  // Strip circular stepMap for JSON safety
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
    })),
  };
}

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
