// Serve the Rambam calculation engine as live ES modules so AI-generated
// artifacts (Claude Artifacts, ChatGPT canvases, standalone HTML pages) can
// `import` it directly from a stable URL without bundling or copy-pasting.
//
//   import { getFullCalculation } from "https://<site>/engine/pipeline.js";
//
// This is the single source of truth — these files are the ACTUAL engine
// used by the dashboard UI, bundled into the function via `included_files`
// in netlify.toml. Edit `src/engine/*.js` in the repo and it ships here.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ENGINE_DIR, listEngineFiles, BROWSER_IMPORT_MAP } from './_engineFiles.mjs';

const ALLOWED = new Set(listEngineFiles());

const BANNER = (file) => `/*
 * Kiddush HaChodesh — live engine module: ${file}
 * Source: https://github.com/rayistern/kidushhachodesh/blob/main/src/engine/${file}
 * License: MIT. Free to import, fork, and remix.
 *
 * This file is served live from the canonical source. To use it from an
 * artifact or standalone page:
 *
 *   import { getFullCalculation } from "/engine/pipeline.js";
 *   const calc = getFullCalculation(new Date());
 *
 * See /llms.txt and /docs/BUILDING_WITH_THE_ENGINE.md for recipes.
 */

`;

export default async (req) => {
  const url = new URL(req.url);
  // Netlify's status-200 rewrites keep the ORIGINAL url, so through the
  // /kh proxy this function sees /kh/engine/... — strip the optional
  // prefix (and optional trailing slash, so bare `/engine` serves the
  // index). This is why /kh/engine/* 404'd since launch.
  const name = url.pathname.replace(/^(?:\/kh)?\/engine\/?/, '');

  // Index listing
  if (!name || name === '' || name === 'index.json') {
    return new Response(
      JSON.stringify(
        {
          description:
            "Rambam's Kiddush HaChodesh calculation engine, served as live ES modules.",
          license: 'MIT',
          import_example:
            'import { getFullCalculation } from "/engine/pipeline.js"',
          note:
            'The engine has one bare dependency: the `hebcal` npm package ' +
            '(imported by epochDays.js and fixedCalendar/). Browsers need ' +
            'the import map below; Node consumers should vendor the files ' +
            'and `npm install hebcal`.',
          browser_import_map: BROWSER_IMPORT_MAP,
          files: [...ALLOWED].map((f) => ({
            name: f,
            url: `/engine/${f}`,
          })),
          entrypoint: '/engine/pipeline.js',
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*',
        },
      }
    );
  }

  if (!ALLOWED.has(name)) {
    return new Response(`Not found: ${name}`, { status: 404 });
  }

  let body;
  try {
    body = readFileSync(path.join(ENGINE_DIR, name), 'utf8');
  } catch {
    return new Response(`Not found: ${name}`, { status: 404 });
  }

  return new Response(BANNER(name) + body, {
    status: 200,
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
    },
  });
};

export const config = { path: ['/engine', '/engine/*'] };
