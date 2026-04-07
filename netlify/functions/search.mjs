import { searchCorpus, json } from './_lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const results = searchCorpus(q);
  return json(200, { query: q, count: results.length, results });
};

export const config = { path: '/api/search' };
