// Machine-readable discovery root for the public Kiddush HaChodesh API.
//
// This is the ONE URL external consumers should pin — the singlemcp
// kh-astronomy skill, AI artifacts, scripts. Everything else is
// discovered from it, so a future hosting migration only has to keep
// this path (and the paths it lists) serving. The path set is a stable
// contract: see docs/API_CONTRACT.md.
//
// Deliberately dependency-free (no _lib import) so it stays a
// millisecond cold start.

const INDEX = {
  name: 'Kiddush HaChodesh public API',
  description:
    "Rambam's Hilchot Kiddush HaChodesh — astronomical engine, source corpus, " +
    'and MCP server. All endpoints are read-only, unauthenticated, CORS-open, MIT.',
  base: 'https://www.shluchimexchange.ai/kh',
  contract:
    'These paths are a stable contract, kept working across hosting ' +
    'migrations. Changes are additive; breaking changes get a new path. ' +
    'See /docs/API_CONTRACT.md (relative to base).',
  endpoints: [
    {
      path: '/api/calculate',
      method: 'GET',
      params: { date: 'YYYY-MM-DD (Gregorian)' },
      description:
        "Run the full 30-step Rambam pipeline (KH 11-17 + fixed-calendar chain) " +
        'for a date. Returns sun/moon/visibility values and every step with ' +
        'Hebrew name, KH citation, formula, and formatted value. Use this — ' +
        'never compute the pipeline by hand.',
    },
    {
      path: '/api/search',
      method: 'GET',
      params: {
        q: 'query (English or Hebrew transliteration)',
        type: 'optional filter: doc | class | step | galgal | chapter | concept | source_type',
      },
      description: 'Full-text search across the unified corpus.',
    },
    {
      path: '/api/source',
      method: 'GET',
      params: { area: 'engine | docs', file: 'optional; omit to list' },
      description: 'Browse engine source and docs (whitelisted, read-only).',
    },
    {
      path: '/docs/{file}',
      method: 'GET',
      description:
        'Raw markdown docs, including subfolders (sources/, audits/). ' +
        'Verbatim Rambam source texts live at /docs/sources/KH_{14,15,16,17}_verbatim.md.',
    },
    {
      path: '/templates',
      method: 'GET',
      description: 'Starter templates (standalone HTML calculator, Node CLI).',
    },
    {
      path: '/engine/index.json',
      method: 'GET',
      description:
        'Live ES-module engine: module list + the browser import map for ' +
        "the engine's one bare dependency (hebcal).",
    },
    {
      path: '/mcp',
      method: 'POST',
      description:
        'Public MCP server (JSON-RPC, no auth) — 9 tools over the same ' +
        'engine and corpus.',
    },
    {
      path: '/embed',
      method: 'GET',
      params: {
        date: 'YYYY-MM-DD (optional)',
        view: 'scene | ribbon | visibility | steps (optional)',
        step: 'step id to pre-select (optional)',
      },
      description:
        'Embeddable observatory (iframe surface, no chrome): the 3D ' +
        'galgalim scene, 2D ecliptic ribbon, KH 17 visibility panel, or ' +
        'step drill-down, postMessage-controlled. Protocol: /docs/EMBED_PROTOCOL.md.',
    },
    {
      path: '/llms.txt',
      method: 'GET',
      description: 'Human/AI-readable overview of the whole surface.',
    },
  ],
};

export default async () =>
  new Response(JSON.stringify(INDEX, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });

export const config = { path: ['/api', '/api/index.json'] };
