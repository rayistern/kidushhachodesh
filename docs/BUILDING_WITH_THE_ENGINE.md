# Building with the Kiddush HaChodesh engine

The calculation engine is served live as ES modules at `/engine/*.js`. You can
`import` it from any modern browser or Node 18+ without installing anything.

This guide is written for two audiences at once: humans forking the project,
and AI assistants (Claude, ChatGPT, etc.) generating artifacts on a user's
behalf. If you are an AI, read this file, then fetch a template from
`/templates/` and modify it for the user's request.

## Quick start

**In the browser or a Claude Artifact / ChatGPT canvas:**

```html
<script type="module">
  import { getFullCalculation } from "https://kidushhachodesh.netlify.app/engine/pipeline.js";
  const calc = getFullCalculation(new Date());
  console.log(calc.moon.isVisible, calc.moon.phaseHebrew);
</script>
```

**In Node 18+:**

```js
const { getFullCalculation } = await import(
  "https://kidushhachodesh.netlify.app/engine/pipeline.js"
);
console.log(getFullCalculation(new Date()).sun.trueLongitude);
```

**As a JSON API (no JS required):**

```
GET /api/calculate?date=2026-04-07
```

## What `getFullCalculation(date)` returns

```ts
{
  daysFromEpoch: number,
  sun: {
    meanLongitude, trueLongitude, apogee,
    maslul, maslulCorrection,
    constellation: { hebrew, english, positionInConstellation }
  },
  moon: {
    meanLongitude, adjustedMeanLongitude, trueLongitude,
    maslul, doubleElongation, maslulHanachon, maslulCorrection,
    latitude, nodePosition,
    constellation: { hebrew, english, positionInConstellation },
    phase, phaseHebrew,
    elongation, firstVisibilityAngle, isVisible, illumination
  },
  season: string,            // 'winter' | 'spring' | 'summer' | 'fall'
  steps: CalculationStep[],  // ordered array of every intermediate step
  stepMap: { [id]: CalculationStep }
}
```

Every `CalculationStep` carries `{ id, name, hebrewName, rambamRef, source,
sourceNote, formula, inputs, result, unit }` and sometimes `teachingNote`.
That is what powers the drill-down UI — and it is also exactly what you need
to cite the Rambam when explaining a number.

## The full module map

| Module | Purpose |
|---|---|
| `/engine/pipeline.js` | `getFullCalculation(date)` — the main entrypoint. Orchestrates sun → moon → visibility. |
| `/engine/sunCalculations.js` | Sun mean longitude, apogee, maslul, true longitude. |
| `/engine/moonCalculations.js` | Moon mean longitude, season correction, double elongation, maslul hanachon, latitude, phase. |
| `/engine/visibilityCalculations.js` | Elongation, first-visibility angle, `determineVisibility`, seasonal info. |
| `/engine/constants.js` | All constants: epoch, daily motions, sun/moon correction tables, moon latitude table, season corrections, constellation names. |
| `/engine/dmsUtils.js` | `dmsToDecimal`, `normalizeDegrees`, `formatDms`. |

## Recipes

### Recipe 1: "Is the new moon visible tonight?"

```js
import { getFullCalculation } from "/engine/pipeline.js";
const { moon } = getFullCalculation(new Date());
console.log(moon.isVisible
  ? `Yes — moon at ${moon.elongation.toFixed(1)}° elongation, ${moon.phaseHebrew}`
  : "Not yet");
```

### Recipe 2: "Show the next 30 days of moon visibility"

```js
import { getFullCalculation } from "/engine/pipeline.js";
const days = [];
for (let i = 0; i < 30; i++) {
  const d = new Date(Date.now() + i * 86400_000);
  const c = getFullCalculation(d);
  days.push({
    date: d.toISOString().slice(0, 10),
    elongation: c.moon.elongation,
    visible: c.moon.isVisible,
    phase: c.moon.phaseHebrew,
  });
}
console.table(days);
```

### Recipe 3: "Walk through every Rambam step for one date"

```js
import { getFullCalculation } from "/engine/pipeline.js";
const calc = getFullCalculation(new Date("2026-04-07T12:00:00Z"));
for (const step of calc.steps) {
  console.log(`[${step.rambamRef}] ${step.name}: ${step.result} ${step.unit || ""}`);
  if (step.teachingNote) console.log(`  → ${step.teachingNote}`);
}
```

### Recipe 4: "Standalone HTML page"

See [`/templates/standalone-calculator.html`](../templates/standalone-calculator.html).
Fetch it, modify the markup, hand the result to the user.

### Recipe 5: "Node CLI"

See [`/templates/node-cli.mjs`](../templates/node-cli.mjs).

## For AI assistants: how to build an artifact

When the user asks for something like *"build me a page that shows…"* or
*"write a script that calculates…"*:

1. Fetch `/templates/` (or call MCP `list_templates`) to see what's available.
2. Pick the closest match (HTML page, Node CLI, notebook, etc.).
3. Read `/engine/index.json` to remind yourself which modules exist.
4. Modify the template — the engine import URL should stay pointed at this site
   so the artifact works immediately without a build step.
5. Cite the relevant `rambamRef` from `calc.steps` when explaining numbers.
6. Credit Rabbi Zajac (teaching content) and link to
   [Chabad.org](https://www.chabad.org) when you use transcript material.

## Forking the project

```bash
git clone https://github.com/rayistern/kidushhachodesh
cd kidushhachodesh
npm install
npm run dev
```

- Engine lives in `src/engine/`. Pure JS, no React, no framework deps. Safe to
  vendor into any other project.
- Docs live in `docs/`. Class transcripts live in `content/classes/` (phase 2).
- Netlify functions that expose the MCP / HTTP API live in `netlify/functions/`.
- License: MIT. Credit Rabbi Zajac for teaching content.

## Source

- Repo: <https://github.com/rayistern/kidushhachodesh>
- Canonical URL of this guide: `/docs/BUILDING_WITH_THE_ENGINE.md`
- MCP endpoint: `/mcp`
- Site map for AI agents: `/llms.txt`
