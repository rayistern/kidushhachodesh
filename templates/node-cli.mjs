#!/usr/bin/env node
/**
 * Kiddush HaChodesh — Node CLI
 * ============================
 * Run the Rambam's full astronomical pipeline for any Gregorian date,
 * right from the terminal. Works with `node` >= 18 (native fetch + ESM).
 *
 *   node node-cli.mjs                 # today
 *   node node-cli.mjs 2026-04-07      # specific date
 *
 * Calls the hosted API (no install needed). Node cannot `import` modules
 * over https:, so to run the engine locally instead: clone the repo (or
 * fetch each file listed at <SITE>/engine/index.json), `npm install
 * hebcal`, and import `src/engine/pipeline.js` directly.
 *
 * Source: https://github.com/rayistern/kidushhachodesh (MIT)
 * Teachings by Rabbi Zajac via Chabad.org (https://www.chabad.org).
 */

// Change this if self-hosting.
const SITE = process.env.KH_SITE || 'https://www.shluchimexchange.ai/kh';

const arg = process.argv[2];
const date = arg ? new Date(arg + 'T12:00:00Z') : new Date();
if (Number.isNaN(date.getTime())) {
  console.error('Invalid date. Use YYYY-MM-DD.');
  process.exit(1);
}
const iso = date.toISOString().slice(0, 10);

const res = await fetch(`${SITE}/api/calculate?date=${iso}`);
if (!res.ok) {
  console.error(`API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const calc = await res.json();

console.log(`\nKiddush HaChodesh — ${iso}\n`);
console.log(`  Days from epoch:   ${calc.daysFromEpoch}`);
console.log(`  Sun true lon:      ${calc.sun.trueLongitude.toFixed(4)}° (${calc.sun.constellation.english})`);
console.log(`  Moon true lon:     ${calc.moon.trueLongitude.toFixed(4)}° (${calc.moon.constellation.english})`);
console.log(`  Elongation:        ${calc.moon.elongation.toFixed(4)}°`);
console.log(`  Moon phase:        ${calc.moon.phaseHebrew}`);
console.log(`  Visible tonight?   ${calc.moon.isVisible ? 'yes' : 'no'}`);
console.log(`  Season:            ${calc.season.currentSeason} (${calc.season.daysUntilNextSeason} days to next)\n`);

console.log('All pipeline steps:');
for (const s of calc.steps) {
  const val = typeof s.result === 'number' ? s.result.toFixed(4) : s.formatted ?? String(s.result);
  console.log(`  [${(s.rambamRef || '').padEnd(8)}]  ${s.name.padEnd(34)} = ${val} ${s.unit || ''}`);
}
