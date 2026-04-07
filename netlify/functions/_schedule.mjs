// Hardcoded Rambam daily-learning schedule for the current Kiddush HaChodesh
// week. The Rambam 3-chapters-a-day cycle reaches Hilchot Kiddush HaChodesh
// on 2026-04-07; the nine chapters (KH 11-19) — wait, the user's learning
// opens on chapter 12 today, so this covers KH 12-19 across three days.
//
// This is an LLM-facing head-start: the MCP server exposes it via
// `get_daily_rambam`, and the corpus loader indexes each day as a
// `schedule:` entry so `search` and `fetch` find it too.
//
// When the week ends, either extend this table or remove the stale entries.

export const RAMBAM_DAILY = [
  {
    date: '2026-04-07',
    label: "Tuesday, 20 Nisan 5786 — entering Hilchot Kiddush HaChodesh",
    chapters: [
      { tractate: 'Kiddush HaChodesh', num: 12 },
      { tractate: 'Kiddush HaChodesh', num: 13 },
      { tractate: 'Kiddush HaChodesh', num: 14 },
    ],
    teaser:
      "Today opens the sun model (KH 12-13) and the start of the moon's mean motion (KH 14). Ask for the sun's emtzoi/amiti for today, or a standalone calculator for chapter 13's maslul table.",
  },
  {
    date: '2026-04-08',
    label: 'Wednesday, 21 Nisan 5786',
    chapters: [
      { tractate: 'Kiddush HaChodesh', num: 15 },
      { tractate: 'Kiddush HaChodesh', num: 16 },
      { tractate: 'Kiddush HaChodesh', num: 17 },
    ],
    teaser:
      "The heart of the moon model: merchak kaful, nekudah hanichaches, maslul hanachon, moon latitude, and the start of 'arc of sighting'. Great day to run `calculate` on an upcoming Rosh Chodesh and watch the visibility pipeline light up.",
  },
  {
    date: '2026-04-09',
    label: 'Thursday, 22 Nisan 5786 — closing KH',
    chapters: [
      { tractate: 'Kiddush HaChodesh', num: 18 },
      { tractate: 'Kiddush HaChodesh', num: 19 },
    ],
    teaser:
      "Closing Kiddush HaChodesh: the full visibility conditions (KH 18) and the additional rules (KH 19). Good moment to ask for a side-by-side: Rambam's predicted first visibility vs. a modern ephemeris, generated as a standalone HTML artifact.",
  },
];

const ARTIFACT_IDEAS = [
  "Standalone HTML calculator for today's chapters (fork /templates/standalone-calculator.html).",
  "Node CLI that prints today's sun/moon pipeline (fork /templates/node-cli.mjs).",
  "Chart of the maslul correction table for chapter 13 or 15 using the live engine.",
  "A first-visibility check for the next Rosh Chodesh, citing KH 17-18.",
];

export function getTodayLearning(dateStr) {
  const today = (dateStr || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const entry = RAMBAM_DAILY.find((d) => d.date === today);
  if (!entry) {
    return {
      date: today,
      inKiddushHaChodeshWeek: false,
      note: "No hardcoded Kiddush HaChodesh entry for this date. The hardcoded window is 2026-04-07 through 2026-04-09. Use `calculate` for astronomical data and `search` for teaching content.",
      window: { start: RAMBAM_DAILY[0].date, end: RAMBAM_DAILY[RAMBAM_DAILY.length - 1].date },
    };
  }
  return {
    date: entry.date,
    inKiddushHaChodeshWeek: true,
    label: entry.label,
    chapters: entry.chapters,
    teaser: entry.teaser,
    relatedCorpusIds: entry.chapters.map((c) => `chapter:${c.num}`),
    artifactIdeas: ARTIFACT_IDEAS,
    suggestedNextCalls: [
      { tool: 'fetch', args: { id: `chapter:${entry.chapters[0].num}` } },
      { tool: 'calculate', args: { date: entry.date } },
      { tool: 'list_templates', args: {} },
    ],
  };
}
