// Model Context Protocol server for Kiddush HaChodesh.
//
// Minimal Streamable-HTTP MCP implementation — just enough JSON-RPC 2.0 for
// Claude Desktop, claude.ai connectors, ChatGPT developer-mode connectors,
// and Cursor. No auth, no SSE — read-only.
//
// Tools exposed:
//   search            — full-text search across the unified corpus (docs,
//                       class transcripts, calculation steps, galgalim,
//                       Rambam chapters, concepts, source categories).
//   fetch             — fetch a single entry by id.
//   calculate         — run the Rambam pipeline for a Gregorian date.
//   list_templates    — list AI-artifact starter templates.
//   get_template      — fetch one template verbatim.
//   list_source       — list whitelisted source files (engine, docs).
//   get_source        — fetch one source file verbatim.
//   stats             — corpus stats (what's indexed, how many of each).
//
// See /llms.txt for the full site map and /docs/BUILDING_WITH_THE_ENGINE.md
// for artifact-generation recipes.

import {
  searchCorpus,
  fetchById,
  runCalculation,
  listSource,
  getSource,
  listTemplates,
  getTemplate,
  corpusStats,
  json,
} from './_lib.mjs';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'kidush-hachodesh', version: '0.2.0' };

const INSTRUCTIONS = `This server exposes the Rambam's Kiddush HaChodesh calculations
and teaching content (including class transcripts by Rabbi Zajac, hosted via
Chabad.org). Use \`search\` to find content across docs, class transcripts,
calculation steps, galgalim, Rambam chapters, and concept pages. Use \`fetch\`
to read a full entry. Use \`calculate\` to run the full astronomical pipeline
for any Gregorian date — never guess numeric values.

When the user asks you to BUILD something (a standalone page, a script, a
chart, a notebook), call \`list_templates\` then \`get_template\`, modify
the template for the request, and hand the result to the user as an artifact.
The engine is served live at /engine/pipeline.js so the artifact works with
no build step. Use \`list_source\`/\`get_source\` to read the engine itself.

Credit Rabbi Zajac and link to Chabad.org (https://www.chabad.org) when
quoting class transcript content. The project is MIT-licensed — fork freely.`;

const TOOLS = [
  {
    name: 'search',
    description:
      'Full-text search across the unified Kiddush HaChodesh corpus: docs, class transcripts (Rabbi Zajac), calculation steps (21 Rambam steps with teaching notes), galgalim, Rambam chapters (KH 11-19), concept pages, and source-provenance categories. Returns ranked {id, type, title, rambamRef, url, snippet}. Follow up with `fetch` to read the full entry. Optional `type` filter narrows results to one category.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (English or Hebrew transliteration).' },
        type: {
          type: 'string',
          description: 'Optional type filter: doc | class | step | galgal | chapter | concept | source_type',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch',
    description:
      'Fetch the full content of one corpus entry by id (as returned by `search`). Ids are namespaced, e.g. `step:sunMaslul`, `galgal:moon`, `class:class2a`, `doc:CALCULATIONS.md`, `concept:emtzoi-vs-amiti`, `chapter:14`.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'calculate',
    description:
      "Run the Rambam's full astronomical pipeline for a Gregorian date. Returns every intermediate step (sun mean/true longitude, apogee, maslul, moon maslul, double elongation, maslul hanachon, latitude, node, elongation, phase, first visibility, seasonal info) with its Rambam chapter reference and teaching note. Use this instead of guessing any numeric values.",
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Gregorian date as YYYY-MM-DD.' },
      },
      required: ['date'],
    },
  },
  {
    name: 'list_templates',
    description:
      'List starter templates for generating AI artifacts (standalone HTML calculators, Node CLIs, notebooks, etc.) that import the live engine. Follow up with `get_template` to read one, then modify for the user.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_template',
    description:
      'Fetch a starter template verbatim. The returned text is ready to modify and hand the user as an artifact. All templates import the engine from /engine/pipeline.js — keep that URL pointed at the live site unless the user asks otherwise.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Template filename, e.g. "standalone-calculator.html".' } },
      required: ['name'],
    },
  },
  {
    name: 'list_source',
    description:
      'List whitelisted source areas and files (the calculation engine and the docs). Use this to discover the module map before reading individual files with `get_source`. Each file also has a stable live URL under /engine/ or /docs/ and a GitHub URL for forking.',
    inputSchema: {
      type: 'object',
      properties: {
        area: { type: 'string', description: 'Optional: "engine" | "docs". Omit for a list of areas.' },
      },
    },
  },
  {
    name: 'get_source',
    description:
      'Fetch the full text of one source file (engine module or doc). Use this when you need to read the actual implementation to explain it, cite it, or adapt it into an artifact the user wants. The project is MIT-licensed — quoting and forking are explicitly allowed.',
    inputSchema: {
      type: 'object',
      properties: {
        area: { type: 'string', description: '"engine" or "docs"' },
        file: { type: 'string', description: 'Filename within the area.' },
      },
      required: ['area', 'file'],
    },
  },
  {
    name: 'stats',
    description: 'Return corpus statistics — total entries and counts per type. Useful for sanity-checking what is indexed.',
    inputSchema: { type: 'object', properties: {} },
  },
];

// ─── JSON-RPC helpers ─────────────────────────────────────────
function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}
function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}
function textContent(obj, isError = false) {
  const text = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  const out = { content: [{ type: 'text', text }] };
  if (isError) out.isError = true;
  return out;
}

// ─── Dispatch one RPC message ─────────────────────────────────
async function handleRpc(msg) {
  const { id, method, params } = msg || {};
  try {
    switch (method) {
      case 'initialize':
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
          instructions: INSTRUCTIONS,
        });

      case 'notifications/initialized':
      case 'initialized':
        return null; // notification, no response

      case 'tools/list':
        return rpcResult(id, { tools: TOOLS });

      case 'tools/call':
        return rpcResult(id, await callTool(params?.name, params?.arguments || {}));

      case 'ping':
        return rpcResult(id, {});

      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    return rpcError(id, -32603, `Internal error: ${e.message}`);
  }
}

// ─── Tool dispatch ────────────────────────────────────────────
async function callTool(name, args) {
  switch (name) {
    case 'search': {
      const results = searchCorpus(args.query || '', { type: args.type });
      return textContent({ query: args.query, type: args.type, count: results.length, results });
    }
    case 'fetch': {
      const entry = fetchById(args.id);
      if (!entry) return textContent(`Not found: ${args.id}`, true);
      return textContent(entry);
    }
    case 'calculate': {
      try {
        return textContent(runCalculation(args.date));
      } catch (e) {
        return textContent(`Error: ${e.message}`, true);
      }
    }
    case 'list_templates':
      return textContent({ templates: listTemplates() });
    case 'get_template': {
      const body = getTemplate(args.name);
      if (body == null) return textContent(`Not found: ${args.name}`, true);
      return textContent(body);
    }
    case 'list_source': {
      const listing = listSource(args.area);
      if (!listing) return textContent(`Unknown area: ${args.area}`, true);
      return textContent(listing);
    }
    case 'get_source': {
      const src = getSource(args.area, args.file);
      if (!src) return textContent(`Not found: ${args.area}/${args.file}`, true);
      return textContent(src);
    }
    case 'stats':
      return textContent(corpusStats());
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── HTTP handler ─────────────────────────────────────────────
export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type, mcp-session-id',
      },
    });
  }

  // GET → human/agent-readable descriptor
  if (req.method === 'GET') {
    return json(200, {
      server: SERVER_INFO,
      protocol: 'mcp',
      protocolVersion: PROTOCOL_VERSION,
      transport: 'streamable-http',
      endpoint: '/mcp',
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      stats: corpusStats(),
      note: 'POST JSON-RPC 2.0 messages to this URL. See /llms.txt for the full site map.',
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }

  if (Array.isArray(body)) {
    const out = [];
    for (const msg of body) {
      const resp = await handleRpc(msg);
      if (resp) out.push(resp);
    }
    return json(200, out);
  }

  const resp = await handleRpc(body);
  if (resp === null) return new Response(null, { status: 202 });
  return json(200, resp);
};

export const config = { path: ['/mcp', '/.well-known/mcp'] };
