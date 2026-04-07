/**
 * rambamChips — parse a halacha HTML string and wrap recognizable
 * numerical / term references in a <button data-chip-step="..."> so a
 * click handler delegated on the container can route to the right
 * calculation step (D3 — Halacha ↔ value cross-links).
 *
 * We operate on a DOMParser document fragment so we never mangle
 * attribute values; regex rewriting happens only on text nodes.
 *
 * Keywords → step IDs map. Matches are case-insensitive; first hit wins.
 */
const KEYWORD_STEPS = [
  // Hebrew
  { re: /אמצע\s*השמש/g, step: 'sunMeanLongitude' },
  { re: /מקום\s*השמש/g, step: 'sunTrueLongitude' },
  { re: /גובה\s*השמש/g, step: 'sunApogee' },
  { re: /מסלול\s*השמש/g, step: 'sunMaslul' },
  { re: /אמצע\s*הירח/g, step: 'moonMeanLongitude' },
  { re: /מקום\s*הירח/g, step: 'moonTrueLongitude' },
  { re: /מסלול\s*הירח/g, step: 'moonMaslul' },
  { re: /מסלול\s*נכון/g, step: 'maslulHanachon' },
  { re: /מרחק\s*כפול/g, step: 'doubleElongation' },
  { re: /רוחב\s*הירח/g, step: 'moonLatitude' },
  { re: /ראש\s*התלי/g, step: 'nodePosition' },
  { re: /קשת\s*הראייה/g, step: 'moonVisibility' },
  { re: /אורך\s*ראשון/g, step: 'elongation' },
  // English
  { re: /mean\s*longitude\s*of\s*the\s*sun/gi, step: 'sunMeanLongitude' },
  { re: /true\s*longitude\s*of\s*the\s*sun/gi, step: 'sunTrueLongitude' },
  { re: /apogee/gi, step: 'sunApogee' },
  { re: /mean\s*longitude\s*of\s*the\s*moon/gi, step: 'moonMeanLongitude' },
  { re: /true\s*longitude\s*of\s*the\s*moon/gi, step: 'moonTrueLongitude' },
  { re: /course\s*of\s*the\s*moon/gi, step: 'moonMaslul' },
  { re: /double\s*elongation/gi, step: 'doubleElongation' },
  { re: /latitude\s*of\s*the\s*moon/gi, step: 'moonLatitude' },
  { re: /arc\s*of\s*vision/gi, step: 'moonVisibility' },
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
