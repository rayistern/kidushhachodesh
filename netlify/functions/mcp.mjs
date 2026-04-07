// Minimal Model Context Protocol (MCP) server over Streamable HTTP.
// Implements just enough JSON-RPC 2.0 for consumer MCP clients:
//   initialize, tools/list, tools/call (search | fetch | calculate).
// No auth, no SSE, no resources — read-only. Good enough for Claude / ChatGPT
// connectors that want a simple "paste this URL" experience.

import { searchCorpus, fetchById, runCalculation, json } from './_lib.mjs';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = {
  name: 'kidush-hachodesh',
  version: '0.1.0',
};

const TOOLS = [
  {
    name: 'search',
    description:
      "Full-text search over the Kiddush HaChodesh docs and the Rambam's calculation steps. Returns ranked results with id, title, snippet, and canonical URL. Use the returned id with the `fetch` tool to retrieve full content.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (English or Hebrew transliteration).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch',
    description:
      'Fetch the full content of a document or calculation-step entry by id (as returned by `search`). Ids look like `doc:CALCULATIONS.md` or `step:sunMeanLongitude`.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Entry id from a prior search result.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'calculate',
    description:
      "Run the Rambam's full astronomical pipeline for a given Gregorian date and return every intermediate step (sun mean/true longitude, moon maslul, double elongation, latitude, elongation, phase, first visibility, seasonal info). Use this instead of guessing any numeric values. Dates before the epoch (1177-04-03) are not meaningful.",
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Gregorian date as YYYY-MM-DD.' },
      },
      required: ['date'],
    },
  },
];

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}
function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function textContent(obj) {
  const text = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  return { content: [{ type: 'text', text }] };
}

async function handleRpc(msg) {
  const { id, method, params } = msg || {};
  try {
    switch (method) {
      case 'initialize':
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
          instructions:
            "This server exposes the Rambam's Kiddush HaChodesh calculations. Use `search` to find docs or calculation steps, `fetch` to read them, and `calculate` to run the full astronomical pipeline for any Gregorian date. Never guess numeric values — call `calculate`.",
        });

      case 'notifications/initialized':
      case 'initialized':
        return null; // notification, no response

      case 'tools/list':
        return rpcResult(id, { tools: TOOLS });

      case 'tools/call': {
        const name = params?.name;
        const args = params?.arguments || {};
        if (name === 'search') {
          const results = searchCorpus(args.query || '');
          return rpcResult(id, textContent({ query: args.query, count: results.length, results }));
        }
        if (name === 'fetch') {
          const entry = fetchById(args.id);
          if (!entry) return rpcResult(id, { ...textContent(`Not found: ${args.id}`), isError: true });
          return rpcResult(id, textContent(entry));
        }
        if (name === 'calculate') {
          try {
            const result = runCalculation(args.date);
            return rpcResult(id, textContent(result));
          } catch (e) {
            return rpcResult(id, { ...textContent(`Error: ${e.message}`), isError: true });
          }
        }
        return rpcError(id, -32601, `Unknown tool: ${name}`);
      }

      case 'ping':
        return rpcResult(id, {});

      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    return rpcError(id, -32603, `Internal error: ${e.message}`);
  }
}

export default async (req) => {
  const url = new URL(req.url);

  // CORS preflight
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

  // GET on /mcp or /.well-known/mcp → human/agent-readable descriptor.
  if (req.method === 'GET') {
    return json(200, {
      server: SERVER_INFO,
      protocol: 'mcp',
      protocolVersion: PROTOCOL_VERSION,
      transport: 'streamable-http',
      endpoint: '/mcp',
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      note: 'POST JSON-RPC 2.0 messages to this URL. See /llms.txt for a full site map.',
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

  // Support batched requests
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
