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
import { getTodayLearning, RAMBAM_DAILY } from './_schedule.mjs';

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

At the start of a conversation, call \`get_daily_rambam\` to see what the
user is likely learning today (the hardcoded window covers KH 12-19 across
2026-04-07 to 2026-04-09). If it returns a match, greet the user with the
chapters, give them the teaser line, and proactively offer either (a) to
\`fetch\` the \`chapter:\` entries and summarize, (b) to run \`calculate\`
for the date, or (c) to generate a standalone artifact from a template for
that day's material. Do not force it — one offer, then follow the user.

Credit Rabbi Zajac and link to Chabad.org (https://www.chabad.org) when
quoting class transcript content. The project is MIT-licensed — fork freely.`;

// All tools are read-only — annotate so clients like claude.ai can
// auto-approve without a per-call confirmation prompt.
const TOOL_ANNOTATIONS = {
  title: 'Kiddush HaChodesh',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

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
          description: 'Optional type filter: doc | class | step | galgal | chapter | concept | source_type | schedule',
        },
      },
      required: ['query'],
    },
    annotations: TOOL_ANNOTATIONS,
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
    annotations: TOOL_ANNOTATIONS,
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
    annotations: TOOL_ANNOTATIONS,
  },
  {
    name: 'list_templates',
    description:
      'List starter templates for generating AI artifacts (standalone HTML calculators, Node CLIs, notebooks, etc.) that import the live engine. Follow up with `get_template` to read one, then modify for the user.',
    inputSchema: { type: 'object', properties: {} },
    annotations: TOOL_ANNOTATIONS,
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
    annotations: TOOL_ANNOTATIONS,
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
    annotations: TOOL_ANNOTATIONS,
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
    annotations: TOOL_ANNOTATIONS,
  },
  {
    name: 'get_daily_rambam',
    description:
      "Return the hardcoded Rambam daily-learning entry for a given Gregorian date (defaults to today). Covers the current Hilchot Kiddush HaChodesh week only (2026-04-07 through 2026-04-09). Returns the day's chapters, a teaser, related corpus ids (chapter:NN) to `fetch`, and suggested artifact ideas the assistant can proactively offer the user. Call this at the start of a session to greet the user with what they're learning today and offer to generate an artifact or run `calculate` for the date.",
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Optional Gregorian date YYYY-MM-DD. Defaults to today (UTC).' },
      },
    },
    annotations: TOOL_ANNOTATIONS,
  },
  {
    name: 'stats',
    description: 'Return corpus statistics — total entries and counts per type. Useful for sanity-checking what is indexed.',
    inputSchema: { type: 'object', properties: {} },
    annotations: TOOL_ANNOTATIONS,
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
    case 'get_daily_rambam':
      return textContent(getTodayLearning(args.date));
    case 'stats':
      return textContent({ ...corpusStats(), scheduleWindow: { start: RAMBAM_DAILY[0].date, end: RAMBAM_DAILY[RAMBAM_DAILY.length - 1].date } });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── HTTP handler ─────────────────────────────────────────────
//
// Implements just enough of the MCP Streamable HTTP transport spec for
// claude.ai's hosted connector to be happy:
//
//   • Accept: text/event-stream → respond with an SSE-framed single
//     message (the spec allows the response stream to contain just one
//     `message` event and then close).
//   • Accept: application/json → respond with a plain JSON body.
//   • Mcp-Session-Id header → echo it back on every response so clients
//     that track sessions stay happy. We do not actually persist server
//     state per session — every request is stateless — but echoing the
//     header keeps spec-strict clients from rejecting the response.
//   • OPTIONS preflight allows the same headers + Mcp-Protocol-Version.
//
// Note: a separate function file `oauth-metadata.mjs` serves
// /.well-known/oauth-protected-resource so claude.ai's discovery probe
// finds the resource and proceeds without auth.

function sseResponse(payload, sessionId) {
  // Streamable HTTP "single message in a stream" pattern: emit one
  // `event: message` with the JSON-RPC payload as data, then end.
  const text = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
  const headers = {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'mcp-session-id',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  return new Response(text, { status: 200, headers });
}

function jsonResponse(payload, sessionId, status = 200) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'mcp-session-id',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  return new Response(JSON.stringify(payload), { status, headers });
}

function newSessionId() {
  // Cheap, no-state-tracking session id. Real clients echo it back; we
  // don't actually do anything with it server-side.
  return (
    'kh-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
        'access-control-allow-headers':
          'content-type, mcp-session-id, mcp-protocol-version, authorization',
        'access-control-max-age': '86400',
      },
    });
  }

  // Session id: echo whatever the client sent, or mint a new one on
  // initialize. Either way it's just a token, no server state attached.
  const incomingSession = req.headers.get('mcp-session-id') || null;

  // GET → can either be the human-readable descriptor or an SSE stream.
  // Some clients (Streamable HTTP spec) open a long-lived GET to receive
  // server-initiated messages. We don't push any, so we return an empty
  // stream that closes immediately for SSE-Accept clients, or the JSON
  // descriptor otherwise.
  if (req.method === 'GET') {
    const accept = req.headers.get('accept') || '';
    if (accept.includes('text/event-stream')) {
      const headers = {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'mcp-session-id',
      };
      if (incomingSession) headers['mcp-session-id'] = incomingSession;
      // Empty stream — we have no server-initiated messages to send.
      return new Response(': keep-alive\n\n', { status: 200, headers });
    }
    return jsonResponse(
      {
        server: SERVER_INFO,
        protocol: 'mcp',
        protocolVersion: PROTOCOL_VERSION,
        transport: 'streamable-http',
        endpoint: '/mcp',
        tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        stats: corpusStats(),
        note: 'POST JSON-RPC 2.0 messages to this URL. See /llms.txt for the full site map.',
      },
      incomingSession
    );
  }

  // DELETE → client closing a session. Spec compliance: 204.
  if (req.method === 'DELETE') {
    return new Response(null, {
      status: 204,
      headers: { 'access-control-allow-origin': '*' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      incomingSession,
      400
    );
  }

  // Handle batched requests
  let result;
  if (Array.isArray(body)) {
    const out = [];
    for (const msg of body) {
      const resp = await handleRpc(msg);
      if (resp) out.push(resp);
    }
    result = out;
  } else {
    result = await handleRpc(body);
  }

  // Notification-only request: no response payload.
  if (result === null || (Array.isArray(result) && result.length === 0)) {
    return new Response(null, {
      status: 202,
      headers: {
        'access-control-allow-origin': '*',
        ...(incomingSession ? { 'mcp-session-id': incomingSession } : {}),
      },
    });
  }

  // On `initialize`, mint a session id if the client didn't supply one.
  let sessionId = incomingSession;
  const isInit =
    !Array.isArray(body) && body && body.method === 'initialize';
  if (isInit && !sessionId) sessionId = newSessionId();

  // Respect the client's preferred response format.
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/event-stream')) {
    return sseResponse(result, sessionId);
  }
  return jsonResponse(result, sessionId);
};

export const config = { path: ['/mcp', '/.well-known/mcp'] };
