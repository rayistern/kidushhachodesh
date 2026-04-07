// Browseable read-only source endpoint. Complements /engine/* (which serves
// the engine files with a JS content-type for live imports) by returning
// source for any whitelisted area (engine, docs) as plain text for AI
// assistants that want to read and cite code.

import { listSource, getSource, json } from './_lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const area = url.searchParams.get('area');
  const file = url.searchParams.get('file');

  if (!area) return json(200, listSource());

  if (!file) {
    const listing = listSource(area);
    if (!listing) return json(404, { error: `unknown area: ${area}` });
    return json(200, listing);
  }

  const src = getSource(area, file);
  if (!src) return json(404, { error: `not found: ${area}/${file}` });

  return new Response(src.content, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = { path: '/api/source' };
