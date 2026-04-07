// OAuth 2.0 Protected Resource Metadata for the MCP server.
//
// claude.ai's hosted MCP connector (and a few other strict clients)
// probe `/.well-known/oauth-protected-resource` before connecting, even
// for servers that don't actually require auth. Returning a valid
// (minimal, no-auth) metadata document tells the client "this resource
// exists, no authorization servers are required" so it proceeds to the
// MCP endpoint instead of erroring out at discovery.
//
// Spec: RFC 9728 (OAuth 2.0 Protected Resource Metadata).
// MCP authorization spec: see modelcontextprotocol.io / authorization.

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }

  const url = new URL(req.url);
  const origin = url.origin;

  // Minimal protected-resource metadata. We declare the resource (the
  // MCP endpoint) but advertise NO authorization servers — i.e. the
  // resource is publicly accessible. Strict clients still want this doc
  // to exist; lenient clients ignore it entirely.
  const body = {
    resource: `${origin}/mcp`,
    authorization_servers: [],
    bearer_methods_supported: [],
    resource_documentation: `${origin}/llms.txt`,
    // Hint for clients that look here: this is a read-only public MCP
    // server, no auth required, no scopes.
    scopes_supported: [],
    resource_signing_alg_values_supported: [],
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = {
  path: [
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-protected-resource/mcp',
    '/.well-known/oauth-authorization-server',
  ],
};
