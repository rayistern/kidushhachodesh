import { runCalculation, json } from './_lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  try {
    const result = runCalculation(date);
    return json(200, result);
  } catch (e) {
    return json(400, { error: e.message });
  }
};

export const config = { path: '/api/calculate' };
