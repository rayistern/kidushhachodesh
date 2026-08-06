# Observatory embed protocol — v1

Declared 2026-08-06 as part of the one-interface convergence (issue #41;
zajac side: merkos-302/zajac#134). The embed is how zajac (and any other
host) mounts the KH observatory. Its URL params and message shapes are
part of the public API contract (see `docs/API_CONTRACT.md`): changes
are additive; breaking changes bump the protocol version.

## Mounting

    <iframe src="https://www.shluchimexchange.ai/kh/embed?date=2026-08-10&view=scene"
            allow="fullscreen" style="border:0"></iframe>

Query parameters:

| Param | Values | Default | Meaning |
|---|---|---|---|
| `date` | `YYYY-MM-DD` (Gregorian civil day; the computation is for the night following it) | today | Calculation date |
| `view` | `scene` \| `ribbon` \| `visibility` \| `steps` | `scene` | `scene` = 3D galgalim (WebGL). `ribbon` = 2D ecliptic strip — use as the low-end/mobile fallback. `visibility` = the KH 17 chain + verdict panel. `steps` = the full drill-down step list. |
| `step` | a step id (e.g. `doubleElongation`) | — | Pre-select a calculation step |

The embed carries no site navigation and no chrome — the host owns the
frame (title, close button, sizing).

## Messages: host → embed

Send via `iframe.contentWindow.postMessage(msg, 'https://www.shluchimexchange.ai')`:

| Message | Effect |
|---|---|
| `{type:'kh:set-date', date:'YYYY-MM-DD'}` | Recompute for a new date |
| `{type:'kh:set-view', view:'scene'\|'ribbon'\|'visibility'\|'steps'}` | Switch view |
| `{type:'kh:select-step', stepId:'moonTrueLongitude'}` | Select/pulse a step |
| `{type:'kh:camera', preset:'overview'}` | 3D camera preset (scene view) |

Malformed or unknown messages are ignored (fail-silent, additive-safe).

## Messages: embed → host

The embed posts to its parent; the host should check `event.origin ===
'https://www.shluchimexchange.ai'` before trusting events:

| Message | When |
|---|---|
| `{type:'kh:ready', version:1}` | The embed booted |
| `{type:'kh:state', version:1, date, view}` | Initial state echo |
| `{type:'kh:step-selected', version:1, stepId}` | The user drilled into a step inside the embed — hosts can sync surrounding UI (e.g. highlight the halacha being read) |

## Versioning

`version` rides on every embed→host event. v1 is additive-frozen: new
params, views, and message types may appear; existing ones keep their
meaning. A breaking change ships as v2 alongside v1, never replacing it
silently.

## Step ids

Step ids are the engine's step identifiers (`daysFromEpoch`,
`sunMeanLongitude`, … `keshetHaReiyah`). The authoritative list is the
`steps[].id` array in `GET /api/calculate` — discover, don't hardcode.
