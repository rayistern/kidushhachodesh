// Serve docs/*.md as clean markdown at /docs/<file>.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

export default async (req) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/docs\//, '');
  if (!name || name.includes('..') || name.includes('/')) {
    return new Response('Not found', { status: 404 });
  }
  let body;
  try {
    body = readFileSync(path.join(DOCS_DIR, name), 'utf8');
  } catch {
    return new Response(`Not found: ${name}`, { status: 404 });
  }
  const ct = name.endsWith('.md')
    ? 'text/markdown; charset=utf-8'
    : 'text/plain; charset=utf-8';
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': ct,
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = { path: '/docs/*' };
