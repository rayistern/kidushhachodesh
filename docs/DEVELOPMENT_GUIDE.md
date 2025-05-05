# Development Guide

## File / Module map

| Path | Purpose |
|------|---------|
| `src/utils/astronomyCalc.js` | Single source of truth for Sun/Moon positions. |
| `src/components/CelestialVisualization.js` | Canvas renderer, user interaction. |
| `src/constants.js` | All numeric parameters; **no maths** here. |
| `src/utils/dateUtils.js` | Hebrew date conversion & molad formatting. |
| `src/components/*` | UI controls (date picker, knowledge base, etc.). |

---

## Data flow 