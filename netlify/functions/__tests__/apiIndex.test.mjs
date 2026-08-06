/**
 * The /api/index.json discovery root is the ONE URL external consumers
 * pin (docs/API_CONTRACT.md). These tests keep it well-formed and keep
 * its endpoint list honest against the functions that actually exist.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import indexFn from '../api-index.mjs';

const FUNCTIONS_DIR = path.resolve(process.cwd(), 'netlify/functions');

/** Collect every path registered by a function's `export const config`. */
function registeredPaths() {
  const out = new Set();
  for (const f of readdirSync(FUNCTIONS_DIR)) {
    if (!f.endsWith('.mjs') || f.startsWith('_')) continue;
    const body = readFileSync(path.join(FUNCTIONS_DIR, f), 'utf8');
    const m = body.match(/config\s*=\s*\{\s*path:\s*(\[[^\]]*\]|'[^']*')/);
    if (!m) continue;
    for (const p of m[1].match(/'([^']+)'/g) || []) out.add(p.slice(1, -1));
  }
  return out;
}

describe('/api/index.json discovery root', () => {
  it('returns well-formed JSON with base, contract, and endpoints', async () => {
    const res = await indexFn(new Request('https://x.example/api/index.json'));
    expect(res.status).toBe(200);
    const body = JSON.parse(await res.text());
    expect(body.base).toBe('https://www.shluchimexchange.ai/kh');
    expect(body.contract).toContain('stable');
    expect(body.endpoints.length).toBeGreaterThan(5);
    for (const e of body.endpoints) {
      expect(e.path, 'endpoint entry needs path').toBeTruthy();
      expect(e.method, `${e.path} needs method`).toBeTruthy();
      expect(e.description, `${e.path} needs description`).toBeTruthy();
    }
  });

  it('every listed function endpoint corresponds to a registered function path', async () => {
    const res = await indexFn(new Request('https://x.example/api/index.json'));
    const body = JSON.parse(await res.text());
    const registered = registeredPaths();
    for (const e of body.endpoints) {
      // Static assets aren't functions; wildcard entries match their prefix.
      if (e.path === '/llms.txt') continue;
      const bare = e.path.replace(/\/\{[^}]+\}$/, '');
      const ok = [...registered].some(
        (r) => r === e.path || r === bare || r === `${bare}/*` || r.replace('/*', '') === bare,
      );
      expect(ok, `${e.path} is listed but no function registers it`).toBe(true);
    }
  });
});
