/**
 * rambamChips — parse a halacha HTML string and wrap recognizable
 * numerical / term references in a <button data-chip-step="..."> so a
 * click handler delegated on the container can route to the right
 * calculation step (D3 — Halacha ↔ value cross-links).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (chips route to astronomical steps)
 *  SURFACE CATEGORY: internal UI
 * ═══════════════════════════════════════════════════════════════════
 * The KEYWORD_STEPS map currently wires Rambam-text phrases to step
 * IDs in the astronomical pipeline (sunMeanLongitude, moonTrueLongitude,
 * doubleElongation, nodePosition, etc.). Per roadmap R3: if/when we
 * add chips for fixed-calendar concepts (BaHaRaD, dehiyot, molad
 * tishrei), those must route to fixed-calendar steps — never cross
 * regimes. Keep the map grouped by regime once we add R3's fixed-
 * calendar primitives.
 *
 * We operate on a DOMParser document fragment so we never mangle
 * attribute values; regex rewriting happens only on text nodes.
 *
 * Keywords → step IDs map. Matches are case-insensitive; first hit wins.
 */
const KEYWORD_STEPS = [
  // ── Hebrew ── (longer phrases first so they win on overlap)
  { re: /אמצע\s*השמש/g, step: 'sunMeanLongitude' },
  { re: /אמצע\s*מהלך\s*השמש/g, step: 'sunMeanLongitude' },
  { re: /מקום\s*השמש\s*האמיתי/g, step: 'sunTrueLongitude' },
  { re: /מקום\s*השמש/g, step: 'sunTrueLongitude' },
  { re: /גובה\s*השמש/g, step: 'sunApogee' },
  { re: /הגובה/g, step: 'sunApogee' },
  { re: /מסלול\s*השמש/g, step: 'sunMaslul' },
  { re: /מנת\s*המסלול/g, step: 'sunMaslulCorrection' },

  { re: /אמצע\s*הירח/g, step: 'moonMeanLongitude' },
  { re: /אמצע\s*מהלך\s*הירח/g, step: 'moonMeanLongitude' },
  { re: /מקום\s*הירח\s*האמיתי/g, step: 'moonTrueLongitude' },
  { re: /מקום\s*הירח/g, step: 'moonTrueLongitude' },
  { re: /מסלול\s*הירח/g, step: 'moonMaslul' },
  { re: /מסלול\s*נכון/g, step: 'maslulHanachon' },
  { re: /מרחק\s*כפול/g, step: 'doubleElongation' },
  { re: /רוחב\s*הירח/g, step: 'moonLatitude' },
  { re: /רוחב/g, step: 'moonLatitude' },
  { re: /ראש\s*התלי/g, step: 'nodePosition' },
  { re: /ראש/g, step: 'nodePosition' },
  { re: /קשת\s*הראייה/g, step: 'moonVisibility' },
  { re: /קשת\s*הראיה/g, step: 'moonVisibility' },
  { re: /אורך\s*ראשון/g, step: 'elongation' },
  { re: /מולד/g, step: 'moonMeanLongitude' },
  { re: /תקופה/g, step: 'moonSeasonCorrection' },
  { re: /גלגל\s*קטן/g, step: 'moonMaslul' },

  // ── English ── Sefaria's MT translation phrasing (case-insensitive)
  { re: /mean\s+(?:longitude|position|motion|distance)\s+of\s+the\s+sun/gi, step: 'sunMeanLongitude' },
  { re: /sun['’]s\s+mean\s+(?:longitude|position|motion)/gi, step: 'sunMeanLongitude' },
  { re: /true\s+(?:longitude|position|place)\s+of\s+the\s+sun/gi, step: 'sunTrueLongitude' },
  { re: /sun['’]s\s+true\s+(?:longitude|position|place)/gi, step: 'sunTrueLongitude' },
  { re: /actual\s+(?:position|location)\s+of\s+the\s+sun/gi, step: 'sunTrueLongitude' },
  { re: /apogee\s+of\s+the\s+sun/gi, step: 'sunApogee' },
  { re: /sun['’]s\s+apogee/gi, step: 'sunApogee' },
  { re: /apogee/gi, step: 'sunApogee' },
  { re: /course\s+of\s+the\s+sun/gi, step: 'sunMaslul' },
  { re: /sun['’]s\s+course/gi, step: 'sunMaslul' },

  { re: /mean\s+(?:longitude|position|motion|distance)\s+of\s+the\s+moon/gi, step: 'moonMeanLongitude' },
  { re: /moon['’]s\s+mean\s+(?:longitude|position|motion)/gi, step: 'moonMeanLongitude' },
  { re: /true\s+(?:longitude|position|place)\s+of\s+the\s+moon/gi, step: 'moonTrueLongitude' },
  { re: /moon['’]s\s+true\s+(?:longitude|position|place)/gi, step: 'moonTrueLongitude' },
  { re: /actual\s+(?:position|location)\s+of\s+the\s+moon/gi, step: 'moonTrueLongitude' },
  { re: /course\s+of\s+the\s+moon/gi, step: 'moonMaslul' },
  { re: /moon['’]s\s+course/gi, step: 'moonMaslul' },
  { re: /correct(?:ed)?\s+course/gi, step: 'maslulHanachon' },
  { re: /(?:double\s+)?elongation/gi, step: 'doubleElongation' },
  { re: /latitude\s+of\s+the\s+moon/gi, step: 'moonLatitude' },
  { re: /moon['’]s\s+latitude/gi, step: 'moonLatitude' },
  { re: /(?:northern|southern)\s+latitude/gi, step: 'moonLatitude' },
  { re: /head\s+of\s+the\s+(?:dragon|tli)/gi, step: 'nodePosition' },
  { re: /dragon['’]s\s+head/gi, step: 'nodePosition' },
  { re: /ascending\s+node/gi, step: 'nodePosition' },
  { re: /node/gi, step: 'nodePosition' },

  { re: /arc\s+of\s+(?:vision|sighting)/gi, step: 'moonVisibility' },
  { re: /first\s+visibility/gi, step: 'firstVisibilityAngle' },
  { re: /visibility\s+of\s+the\s+(?:new\s+)?moon/gi, step: 'moonVisibility' },
  { re: /sighting\s+of\s+the\s+(?:new\s+)?moon/gi, step: 'moonVisibility' },
  { re: /new\s+moon/gi, step: 'moonVisibility' },
  { re: /molad/gi, step: 'moonMeanLongitude' },
  { re: /conjunction/gi, step: 'moonMeanLongitude' },
  { re: /season/gi, step: 'moonSeasonCorrection' },
  { re: /tekufah/gi, step: 'moonSeasonCorrection' },
  { re: /epicycle/gi, step: 'moonMaslul' },
  { re: /small\s+sphere/gi, step: 'moonMaslul' },
];

/**
 * Wrap chip matches in text nodes only.
 * Operates on a cloned fragment so the input DOM isn't mutated.
 */
export function parseHalachaHTML(html) {
  if (typeof window === 'undefined' || !html) return html || '';
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  if (!root) return html;
  walk(root);
  return root.innerHTML;
}

function walk(node) {
  // Never descend into an element that's already a chip or is a script/style.
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const replaced = replaceInText(child.nodeValue);
      if (replaced !== child.nodeValue) {
        const frag = document.createRange().createContextualFragment(replaced);
        node.replaceChild(frag, child);
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName?.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'button') continue;
      walk(child);
    }
  }
}

function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceInText(text) {
  // Collect all matches across all patterns, resolve non-overlapping.
  const hits = [];
  for (const { re, step } of KEYWORD_STEPS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({ start: m.index, end: m.index + m[0].length, text: m[0], step });
      if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width
    }
  }
  if (hits.length === 0) return text;
  // Sort and drop overlaps
  hits.sort((a, b) => a.start - b.start);
  const kept = [];
  let cursor = -1;
  for (const h of hits) {
    if (h.start >= cursor) {
      kept.push(h);
      cursor = h.end;
    }
  }
  // Build replacement
  let out = '';
  let i = 0;
  for (const h of kept) {
    out += escapeHTML(text.slice(i, h.start));
    out += `<button type="button" class="kh-chip" data-chip-step="${h.step}">${escapeHTML(h.text)}</button>`;
    i = h.end;
  }
  out += escapeHTML(text.slice(i));
  return out;
}
