import { searchCorpus, json } from './_lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || undefined;
  const results = searchCorpus(q, { type });
  return json(200, { query: q, type, count: results.length, results });
};

export const config = { path: '/api/search' };
