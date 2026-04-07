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
 * Uses the live engine hosted at the project site (no install needed).
 * To vendor a local copy instead, replace ENGINE_URL with a path to your
 * cloned `src/engine/pipeline.js`.
 *
 * Source: https://github.com/rayistern/kidushhachodesh (MIT)
 * Teachings by Rabbi Zajac via Chabad.org (https://www.chabad.org).
 */

const ENGINE_URL = 'https://kidushhachodesh.netlify.app/engine/pipeline.js';

const { getFullCalculation } = await import(ENGINE_URL);

const arg = process.argv[2];
const date = arg ? new Date(arg + 'T12:00:00Z') : new Date();
if (Number.isNaN(date.getTime())) {
  console.error('Invalid date. Use YYYY-MM-DD.');
  process.exit(1);
}

const calc = getFullCalculation(date);

console.log(`\nKiddush HaChodesh — ${date.toISOString().slice(0, 10)}\n`);
console.log(`  Days from epoch:   ${calc.daysFromEpoch}`);
console.log(`  Sun true lon:      ${calc.sun.trueLongitude.toFixed(4)}° (${calc.sun.constellation.english})`);
console.log(`  Moon true lon:     ${calc.moon.trueLongitude.toFixed(4)}° (${calc.moon.constellation.english})`);
console.log(`  Elongation:        ${calc.moon.elongation.toFixed(4)}°`);
console.log(`  Moon phase:        ${calc.moon.phaseHebrew}`);
console.log(`  Visible tonight?   ${calc.moon.isVisible ? 'yes' : 'no'}`);
console.log(`  Season:            ${calc.season}\n`);

console.log('All pipeline steps:');
for (const s of calc.steps) {
  const val = typeof s.result === 'number' ? s.result.toFixed(4) : s.result;
  console.log(`  [${s.rambamRef || '     '}]  ${s.name.padEnd(30)} = ${val} ${s.unit || ''}`);
}
