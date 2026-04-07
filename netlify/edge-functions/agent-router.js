// Edge function that makes the root URL "just work" when an AI fetches it.
//
// Problem: this is a JS-rendered React SPA. When a browsing AI (Claude's
// web tool, ChatGPT with browsing, Perplexity, GPTBot, etc.) fetches the
// root URL, it either:
//   (a) doesn't run JS and sees only the React shell, or
//   (b) runs JS and sees the dashboard but no agent-directed content.
// Either way, it can't discover /llms.txt, /mcp, /api/*, etc.
//
// Solution: at the edge, detect known AI user agents and content-type
// sniff the `accept` header. For bots/agents, return /llms.txt inline as
// the body of `/`. Real browsers pass through to the SPA unchanged.
//
// This is NOT cloaking — we're serving the same canonical URLs; we're
// just choosing the representation that the client can actually use.

const AGENT_UA_PATTERNS = [
  // Anthropic / Claude
  /claudebot/i,
  /claude-web/i,
  /claude-user/i,
  /anthropic/i,
  // OpenAI / ChatGPT
  /gptbot/i,
  /chatgpt-user/i,
  /oai-searchbot/i,
  /openai/i,
  // Perplexity
  /perplexitybot/i,
  /perplexity/i,
  // Google AI
  /google-extended/i,
  /googleother/i,
  // Meta / Bytedance / etc.
  /meta-externalagent/i,
  /bytespider/i,
  // Generic
  /ai2bot/i,
  /cohere-ai/i,
  /mistralai/i,
  /youbot/i,
  /duckassistbot/i,
  // Generic catch-all — anything clearly not a real browser. Real browser
  // UAs always contain "Mozilla/5.0" as the first token, so these match
  // plain fetchers (curl, python-requests, node-fetch, undici, etc.) that
  // are almost certainly not human users sitting at a browser.
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  /\bscraper\b/i,
  /\bfetch\b/i,
  /\bagent\b/i,
  /python-requests/i,
  /node-fetch/i,
  /undici/i,
  /axios/i,
  /curl\//i,
  /wget/i,
  /httpie/i,
];

function isAgent(req) {
  const ua = req.headers.get('user-agent') || '';
  if (AGENT_UA_PATTERNS.some((re) => re.test(ua))) return true;

  // Explicit opt-in: any client asking for text/plain, text/markdown,
  // or application/json at the root is clearly not a browser.
  const accept = req.headers.get('accept') || '';
  if (!accept.includes('text/html') && accept.length > 0 && accept !== '*/*') {
    if (
      accept.includes('text/plain') ||
      accept.includes('text/markdown') ||
      accept.includes('application/json')
    ) {
      return true;
    }
  }

  // Query-string override so users can force the agent view:
  //   https://site/?for=ai
  try {
    const u = new URL(req.url);
    if (u.searchParams.get('for') === 'ai') return true;
  } catch {}

  return false;
}

export default async (req, context) => {
  if (!isAgent(req)) {
    // Normal browser — serve the SPA as usual.
    return context.next();
  }

  // Agent — fetch the canonical llms.txt and return it inline.
  // We do this by asking the origin for the static file via context.next()
  // on a rewritten path. If that fails for any reason, fall back to a
  // minimal inline map so the response is never empty.
  try {
    const origin = new URL(req.url).origin;
    const res = await fetch(origin + '/llms.txt', {
      headers: { 'user-agent': 'kidushhachodesh-edge-router' },
    });
    if (res.ok) {
      const body = await res.text();
      return new Response(body, {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'public, max-age=300',
          'x-kh-agent-router': 'llms.txt',
          'access-control-allow-origin': '*',
          // Hint to crawlers that this page has an HTML twin at the same URL.
          link: '</>; rel="canonical", </llms.txt>; rel="alternate"; type="text/plain"',
        },
      });
    }
  } catch {
    // fall through to inline fallback
  }

  const fallback = `# Kiddush HaChodesh — agent map

You are an AI agent. This site is a JS-rendered React dashboard, but it
exposes an MCP server and a plain HTTP API so you can chat with the whole
project without running JavaScript.

Start here:
- /llms.txt                 full site map written for agents
- /mcp                      Model Context Protocol endpoint (JSON-RPC 2.0)
- /.well-known/mcp          MCP descriptor
- /api/search?q=…           full-text search (JSON)
- /api/calculate?date=…     full Rambam pipeline for a Gregorian date
- /docs/CALCULATIONS.md     calculation engine docs
- /docs/BUILDING_WITH_THE_ENGINE.md   fork + artifact recipes
- /engine/pipeline.js       live ES module of the calculation engine
- /templates/               starter scaffolds for generating artifacts
- /ai.html                  human-readable guide for end users

Source: https://github.com/rayistern/kidushhachodesh (MIT).
Class transcripts by Rabbi Zajac, credit Chabad.org (https://www.chabad.org).
`;
  return new Response(fallback, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-kh-agent-router': 'fallback',
    },
  });
};

export const config = { path: '/' };
