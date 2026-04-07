import { loadDocs } from './_lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/docs\//, '');
  const doc = loadDocs().find((d) => d.file === name);
  if (!doc) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(doc.body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = { path: '/docs/*' };
