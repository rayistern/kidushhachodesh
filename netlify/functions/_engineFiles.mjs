// Single source of truth for which engine files are served at /engine/*
// and readable via /api/source?area=engine.
//
// The list is computed from the filesystem at cold start instead of being
// hardcoded: the engine grew new modules in April 2026 (periodBlocks,
// epochDays, moladTimeline, fixedCalendar/*) and the old 6-file whitelist
// silently 404'd them, breaking every "import the live engine" recipe the
// docs advertise. A computed list cannot rot that way. The regression test
// `src/engine/__tests__/servedEngineGraph.test.js` walks pipeline.js's
// real import graph against this list.
import { readdirSync } from 'node:fs';
import path from 'node:path';

export const ENGINE_DIR = path.resolve(process.cwd(), 'src/engine');

export function listEngineFiles() {
  const out = [];
  const walk = (rel) => {
    const abs = rel ? path.join(ENGINE_DIR, rel) : ENGINE_DIR;
    for (const ent of readdirSync(abs, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      const relPath = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (ent.name === '__tests__') continue;
        walk(relPath);
      } else if (ent.name.endsWith('.js') && !ent.name.endsWith('.test.js')) {
        out.push(relPath);
      }
    }
  };
  walk('');
  return out.sort();
}

// The engine's only bare (non-relative) import. Browser consumers need an
// import map for it; Node consumers need `npm install hebcal`. Kept here so
// the /engine index, the docs, and the graph test all cite one constant.
export const BARE_IMPORTS = ['hebcal'];

export const BROWSER_IMPORT_MAP = {
  imports: { hebcal: 'https://esm.sh/hebcal@2.3.2' },
};
