# Public API contract

Declared 2026-08-06. This document is the promise that lets external
consumers — the singlemcp `kh-astronomy` skill, AI artifacts, published
templates, scripts — reference this project without breaking when the
hosting changes.

## The contract

1. **The canonical base URL is `https://www.shluchimexchange.ai/kh`.**
   Nothing published outside this repo may reference any other host —
   not the Netlify subdomain, not a future replacement host. The domain
   is fronted by a proxy we control; a hosting migration re-points the
   proxy and the public URLs do not change.

2. **`GET /api/index.json` is the discovery root.** External consumers
   pin that one URL and discover the other endpoints from it. When you
   add or change an endpoint, update the index in
   `netlify/functions/api-index.mjs` in the same commit.

3. **These paths are stable** (relative to the base):
   `/api/index.json`, `/api/calculate`, `/api/search`, `/api/source`,
   `/docs/*`, `/templates/*`, `/engine/*`, `/mcp`, `/llms.txt`, and
   `/embed` (the observatory iframe surface — params + postMessage
   shapes per `docs/EMBED_PROTOCOL.md`, added 2026-08-06).

4. **Changes are additive.** New endpoints, new response fields, and new
   query parameters are fine. Removing or renaming a path, a required
   parameter, or an existing response field is a breaking change: it
   requires a new path (or a versioned one), a deprecation note in the
   index entry, and a survey of the known consumers below.

5. **All endpoints stay read-only, unauthenticated, and CORS-open.**
   Authenticated/metered access is singlemcp's job, layered on top —
   never built into these paths.

### Change log against this contract

- **2026-08-18 (PR #47 integration).** Additive per clause 4: `/api/calculate`
  responses gain six new keys inside each `constellation` object (`index`,
  `translit`, `symbol`, `degreesInto`, `ordinalDegree`, `normalized`) from the
  new shared zodiac helper. Also a **value** change, not a shape change: the
  KH 14:5 season correction for sun 60°–120° follows the Yemenite-manuscript
  reading (+30′, was +15′ per the printed editions), which shifts moon
  positions on those dates and flips 2 sighting verdicts in 50 years — the
  full audit trail is `docs/OPEN_QUESTIONS.md` Q8. Consumers pinning exact
  output values for affected dates must re-pin.

## Known external consumers

- singlemcp `kh-astronomy` skill (merkos-302/singlemcp) — pins
  `/api/index.json`.
- `templates/standalone-calculator.html` and `templates/node-cli.mjs` —
  published copies exist outside our control once users download them.
- Any AI artifact built per `/llms.txt` or `docs/BUILDING_WITH_THE_ENGINE.md`.
- The public MCP server's own tool descriptions reference these paths.

## Migration checklist (when leaving Netlify or re-hosting)

1. Stand up the replacement behind the same proxy paths (`/kh/*`).
2. Run the API tests (`netlify/functions/__tests__/`) against the new host.
3. `curl` every path in `/api/index.json` through the public domain.
4. Only then retire the old host. The public URLs never change.
