// Serve starter templates so AI assistants can fetch them as a scaffold for
// generating artifacts on the user's behalf. All templates are plain text/html
// files under `templates/` in the repo, bundled into the function via
// `included_files` in netlify.toml.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'templates');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function listTemplates() {
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => !f.startsWith('.') && f !== 'README.md')
    .map((f) => ({
      name: f,
      url: `/templates/${f}`,
      kind: path.extname(f).slice(1),
    }));
}

export default async (req) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/templates\/?/, '');

  // Index listing
  if (!name || name === '') {
    const body = {
      description:
        'Starter templates that AI assistants can fetch, modify, and hand the user as a working artifact. All import the live engine from /engine/pipeline.js.',
      license: 'MIT',
      templates: listTemplates(),
      readme_url: '/templates/README.md',
      engine_url: '/engine/pipeline.js',
      building_guide_url: '/docs/BUILDING_WITH_THE_ENGINE.md',
    };
    return new Response(JSON.stringify(body, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
    });
  }

  // Path traversal guard
  if (name.includes('..') || name.includes('/')) {
    return new Response('Not found', { status: 404 });
  }

  let body;
  try {
    body = readFileSync(path.join(TEMPLATES_DIR, name), 'utf8');
  } catch {
    return new Response(`Not found: ${name}`, { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': MIME[ext] || 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = { path: ['/templates', '/templates/*'] };
