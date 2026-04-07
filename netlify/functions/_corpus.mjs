// Unified content corpus for the Kiddush HaChodesh MCP / HTTP search.
//
// This module is the SINGLE SOURCE OF TRUTH for what AI assistants can
// search and fetch. It composes entries from every content source in the
// repo so that a client can hit one `search` tool and get back hits across
// docs, class transcripts, calculation steps, galgalim, Rambam chapters,
// concepts, and source-provenance categories.
//
// If you add a new content source (new class transcript, new concept page,
// a glossary, etc.), add a loader function here and wire it into
// `loadCorpus()`. Nothing else in the search / fetch / MCP layer needs to
// change — all entries conform to the `Entry` shape below.
//
//   Entry = {
//     id: string,             // unique, stable, namespaced ("doc:FOO.md",
//                             //   "step:sunMaslul", "galgal:moon", …)
//     type: string,           // 'doc' | 'class' | 'step' | 'galgal' |
//                             //   'chapter' | 'concept' | 'source_type'
//     title: string,
//     hebrewTitle?: string,
//     rambamRef?: string,
//     tags?: string[],
//     url: string,            // canonical URL on the live site
//     body: string,           // full text for search + fetch
//     attribution?: string,   // e.g. "Rabbi Zajac via Chabad.org"
//   }

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getFullCalculation } from '../../src/engine/pipeline.js';
import { CONSTANTS, SOURCE_TYPES } from '../../src/engine/constants.js';

const ROOT = process.cwd();
const DOCS_DIR = path.resolve(ROOT, 'docs');

// ─────────────────────────────────────────────────────────────
// 1. Markdown docs under docs/
// ─────────────────────────────────────────────────────────────
function loadDocs() {
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const body = readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const titleMatch = body.match(/^#\s+(.+)$/m);
    return {
      id: `doc:${file}`,
      type: 'doc',
      title: titleMatch ? titleMatch[1] : file,
      url: `/docs/${file}`,
      body,
      tags: ['docs', file.replace(/\.md$/, '').toLowerCase()],
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 2. Class transcripts — Rabbi Zajac, via Chabad.org
// ─────────────────────────────────────────────────────────────
const CLASS_META = {
  'class1a.txt': {
    title: "Rabbi Zajac — Rambam Kiddush HaChodesh, Class 1A (Sun Model)",
    summary:
      "Lecture on KH chapters 12-13: the sun model, nested galgalim (blue + red), emtzoi vs. amiti, govah, maslul. Covers Rabbi Losh's pedagogical props (globe, hula hoops, colored spheres) and core mashalim (airplane, phone, money-to-bank).",
    rambamRef: 'KH 12-13',
  },
  'class2a.txt': {
    title: "Rabbi Zajac — Rambam Kiddush HaChodesh, Class 2A (Moon Model)",
    summary:
      "Lecture on KH chapters 14-16: the four moon galgalim (red/domeh, blue/noteh, green/yoitzeh, galgal katan), season correction, double elongation (merchak kaful), nekudah hanichaches, maslul hanachon, rosh/zanav, moon latitude.",
    rambamRef: 'KH 14-16',
  },
};

function loadClasses() {
  const entries = [];
  for (const [file, meta] of Object.entries(CLASS_META)) {
    const full = path.join(DOCS_DIR, file);
    let body;
    try {
      body = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    entries.push({
      id: `class:${file.replace(/\.txt$/, '')}`,
      type: 'class',
      title: meta.title,
      rambamRef: meta.rambamRef,
      url: `/docs/${file}`,
      body: `${meta.summary}\n\n---\n\n${body}`,
      tags: ['class', 'transcript', 'zajac', 'losh'],
      attribution: 'Rabbi Zajac, via Chabad.org (https://www.chabad.org)',
    });
  }
  return entries;
}

// ─────────────────────────────────────────────────────────────
// 3. Calculation steps — harvested from one pipeline run
// ─────────────────────────────────────────────────────────────
let _stepsCache = null;
function loadSteps() {
  if (_stepsCache) return _stepsCache;
  const ref = getFullCalculation(new Date('2024-01-01T12:00:00Z'));
  _stepsCache = ref.steps.map((s) => ({
    id: `step:${s.id}`,
    type: 'step',
    title: s.name,
    hebrewTitle: s.hebrewName,
    rambamRef: s.rambamRef,
    url: `/api/calculate?date=YYYY-MM-DD#${s.id}`,
    body: [
      s.name,
      s.hebrewName && `Hebrew: ${s.hebrewName}`,
      s.rambamRef && `Rambam reference: ${s.rambamRef}`,
      s.source && `Source type: ${s.source}`,
      s.formula && `Formula: ${s.formula}`,
      s.sourceNote && `Source note: ${s.sourceNote}`,
      s.teachingNote && `Teaching note (Rabbi Losh tradition): ${s.teachingNote}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
    tags: ['step', 'calculation', s.source].filter(Boolean),
  }));
  return _stepsCache;
}

// ─────────────────────────────────────────────────────────────
// 4. Galgalim from CONSTANTS.GALGALIM (9 entries)
// ─────────────────────────────────────────────────────────────
function loadGalgalim() {
  return CONSTANTS.GALGALIM.map((g) => ({
    id: `galgal:${g.id}`,
    type: 'galgal',
    title: `${g.englishName} (${g.name})`,
    hebrewTitle: g.name,
    rambamRef: g.reference,
    url: `/concepts/galgal/${g.id}`,
    body: [
      g.englishName,
      g.name && `Hebrew: ${g.name}`,
      g.reference && `Rambam reference: ${g.reference}`,
      g.description,
      g.teachingNote && `Teaching note: ${g.teachingNote}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
    tags: ['galgal', 'cosmology', 'concept'].concat(
      g.teachingNote ? ['losh'] : []
    ),
  }));
}

// ─────────────────────────────────────────────────────────────
// 5. Rambam chapters 11-19 (Hilchot Kiddush HaChodesh)
// ─────────────────────────────────────────────────────────────
const RAMBAM_CHAPTERS = {
  11: { en: 'Astronomical Foundations', he: 'יסודות חשבון התקופות' },
  12: { en: 'Sun Mean Position', he: 'אמצע השמש' },
  13: { en: 'Sun True Position', he: 'מקום השמש האמיתי' },
  14: { en: 'Moon Mean Position', he: 'אמצע הירח' },
  15: { en: 'Moon True Position', he: 'מקום הירח האמיתי' },
  16: { en: "Moon's Latitude", he: 'רוחב הירח' },
  17: { en: 'Arc of Sighting', he: 'קשת הראייה' },
  18: { en: 'Visibility Conditions', he: 'תנאי הראייה' },
  19: { en: 'Additional Rules', he: 'כללים נוספים' },
};

function loadChapters() {
  return Object.entries(RAMBAM_CHAPTERS).map(([num, t]) => ({
    id: `chapter:${num}`,
    type: 'chapter',
    title: `Rambam KH Chapter ${num}: ${t.en}`,
    hebrewTitle: t.he,
    rambamRef: `KH ${num}`,
    url: `https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.${num}`,
    body:
      `Hilchot Kiddush HaChodesh, chapter ${num} — ${t.en} (${t.he}).\n\n` +
      `Full Hebrew + English text is fetched live from Sefaria.org at runtime ` +
      `by the RambamReader component. Use the url to read the source.`,
    tags: ['chapter', 'rambam', 'sefaria'],
  }));
}

// ─────────────────────────────────────────────────────────────
// 6. Concept pages — prose extracted from KnowledgeBase.jsx
// ─────────────────────────────────────────────────────────────
const CONCEPT_ENTRIES = [
  {
    id: 'concept:sun-galgalim',
    type: 'concept',
    title: "The Rambam's Multiple Galgalim Model (Sun)",
    rambamRef: 'KH 12-13',
    url: '/concepts/sun-galgalim',
    body: `According to the Rambam in Hilchot Kiddush HaChodesh, the sun's motion is explained through a system of multiple galgalim (celestial spheres):

- Galgal Gadol (גלגל גדול): the large circle or deferent. The main circle on which the sun appears to travel, but its center is NOT at Earth — it is eccentric.
- Galgal Katan (גלגל קטן): the small circle or epicycle. The sun travels on this smaller circle, which itself travels on the deferent.
- Galgal Yotze (גלגל יוצא): the eccentric circle. Represents the offset of the deferent's center from Earth.

This system accounts for variations in the sun's apparent speed throughout the year — essential for accurate calendar calculations. The calculations involve determining the maslul (course) as the angle between the sun's mean position and its apogee, and applying corrections from the Rambam's table.`,
    tags: ['concept', 'galgal', 'sun', 'maslul'],
  },
  {
    id: 'concept:moon-galgalim',
    type: 'concept',
    title: "The Moon's Four Galgalim System",
    rambamRef: 'KH 14-16',
    url: '/concepts/moon-galgalim',
    body: `The Rambam describes an even more complex system for the Moon, involving four different galgalim:

- Galgal Gadol (גלגל גדול): the large circle / main deferent. The primary orbital path of the Moon.
- Galgal Katan (גלגל קטן): the first epicycle. The Moon moves on this smaller circle, which itself travels on the main deferent.
- Galgal Noteh (גלגל נוטה): the inclined circle. Represents the Moon's deviation from the ecliptic — its north-south motion (latitude).
- Galgal Yotze Merkaz (גלגל יוצא מרכז): the eccentric circle. Represents the offset of the main deferent's center from Earth.

This nested system explains observed variations in the Moon's speed, distance from Earth, position above or below the ecliptic, and monthly cycle of phases. The Rambam uses this model to make precise predictions about when the new moon will be visible — essential for determining the beginning of Hebrew months.`,
    tags: ['concept', 'galgal', 'moon', 'latitude', 'phase'],
  },
  {
    id: 'concept:emtzoi-vs-amiti',
    type: 'concept',
    title: 'Emtzoi vs. Amiti — Mean vs. True Position',
    rambamRef: 'KH 12-13',
    url: '/concepts/emtzoi-vs-amiti',
    body: `Every celestial body in the Rambam's model has two "addresses":

- Emtzoi (אמצעי) — the MEAN position. Where the body would be as seen from the center of its own inner galgal (red for the sun). This is its "own language."
- Amiti (אמיתי) — the TRUE position. Where the body ACTUALLY appears in the mazalos from Earth. This is what Beis Din uses.

Because the red galgal's center is offset from Earth's center, the emtzoi and amiti differ. The maslul correction table is the "translator" from emtzoi to amiti. Max difference for the sun is ~2°; for the moon, ~5°8' (at 100° on the galgal katan, not 90°, because of nekudah hanichaches).

Rabbi Losh's framing: "First know the sun's own language, then translate to ours."`,
    tags: ['concept', 'emtzoi', 'amiti', 'maslul', 'losh'],
  },
  {
    id: 'concept:nekudah-hanichaches',
    type: 'concept',
    title: 'Nekudah Hanichaches — The Shifted Reference Point',
    rambamRef: 'KH 15:1-3',
    url: '/concepts/nekudah-hanichaches',
    body: `For the moon, the Rambam's correction is not measured from Earth's center but from a point BELOW it — the nekudah hanichaches. This "prosneusis point" is what gives the moon's correction table its asymmetry (peaking at 100°, not 90°).

Conceptually: the galgal katan of the moon is watched not from Earth but from this displaced point. The double elongation (merchak kaful, KH 15:1-2) — twice the angle from sun to adjusted moon mean position — is the input to the lookup that determines how much to shift the reference point.

Rabbi Losh's phone mashal: hold a phone close to your face and it blocks ~180° of vision; hold it far away and it blocks ~10°. The galgal katan's apparent diameter changes with perspective in the same way — and the nekudah hanichaches is the "eye" from which the Rambam measures it.`,
    tags: ['concept', 'moon', 'maslul', 'prosneusis', 'losh'],
  },
];

// ─────────────────────────────────────────────────────────────
// 7. Source-type categories (R / ~ / D / L)
// ─────────────────────────────────────────────────────────────
function loadSourceTypes() {
  if (!SOURCE_TYPES) return [];
  return Object.entries(SOURCE_TYPES).map(([key, meta]) => ({
    id: `source_type:${key}`,
    type: 'source_type',
    title: `Source category: ${meta.label || key}`,
    url: '/docs/CALCULATIONS.md#source-annotations',
    body: [
      meta.label,
      meta.description,
      meta.icon && `Icon: ${meta.icon}`,
      meta.color && `Color: ${meta.color}`,
    ]
      .filter(Boolean)
      .join('\n'),
    tags: ['provenance', 'source'],
  }));
}

// ─────────────────────────────────────────────────────────────
// Assemble the full corpus
// ─────────────────────────────────────────────────────────────
let _corpusCache = null;
export function loadCorpus() {
  if (_corpusCache) return _corpusCache;
  _corpusCache = [
    ...loadDocs(),
    ...loadClasses(),
    ...loadSteps(),
    ...loadGalgalim(),
    ...loadChapters(),
    ...CONCEPT_ENTRIES,
    ...loadSourceTypes(),
  ];
  return _corpusCache;
}

export function corpusStats() {
  const c = loadCorpus();
  const byType = {};
  for (const e of c) byType[e.type] = (byType[e.type] || 0) + 1;
  return { total: c.length, byType };
}
