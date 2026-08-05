/**
 * Guards the "import the live engine" promise against whitelist rot.
 *
 * In April 2026 the engine grew new modules (periodBlocks, epochDays,
 * moladTimeline, fixedCalendar/*) while the serving layer's hardcoded
 * 6-file whitelist stood still — so `import "/engine/pipeline.js"`
 * 404'd on module resolution for four months and nothing noticed.
 * The whitelist is now computed from the filesystem
 * (netlify/functions/_engineFiles.mjs); this test walks the engine's
 * REAL static import graph and asserts:
 *
 *   1. every module reachable from the entrypoints is in the served list;
 *   2. the only bare (non-relative) imports are the documented ones,
 *      so the published import-map recipe stays honest.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ENGINE_DIR,
  listEngineFiles,
  BARE_IMPORTS,
} from '../../../netlify/functions/_engineFiles.mjs';

const ENTRYPOINTS = ['pipeline.js', 'liveLongitudes.js'];
const IMPORT_RE = /(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g;

function walkGraph() {
  const reached = new Set();
  const bare = new Set();
  const queue = [...ENTRYPOINTS];
  while (queue.length) {
    const rel = queue.pop();
    if (reached.has(rel)) continue;
    reached.add(rel);
    const body = readFileSync(path.join(ENGINE_DIR, rel), 'utf8');
    for (const m of body.matchAll(IMPORT_RE)) {
      const spec = m[1];
      if (!spec.startsWith('.')) {
        bare.add(spec);
        continue;
      }
      const resolved = path
        .normalize(path.join(path.dirname(rel), spec))
        .replaceAll(path.sep, '/');
      queue.push(resolved);
    }
  }
  return { reached, bare };
}

describe('served engine module graph', () => {
  const { reached, bare } = walkGraph();
  const served = new Set(listEngineFiles());

  it('serves every module the entrypoints actually import', () => {
    for (const rel of reached) {
      expect(served.has(rel), `${rel} reachable but not served at /engine/${rel}`).toBe(true);
    }
  });

  it('has no undocumented bare imports (import-map recipe stays honest)', () => {
    expect([...bare].sort()).toEqual([...BARE_IMPORTS].sort());
  });

  it('the graph is non-trivial (sanity: the walk actually walked)', () => {
    expect(reached.size).toBeGreaterThan(8);
    expect(served.has('pipeline.js')).toBe(true);
    expect(served.has('fixedCalendar/index.js')).toBe(true);
  });
});
