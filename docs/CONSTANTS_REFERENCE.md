# Constants Reference

_All keys below live in `src/constants.js`._

| Key | Default | Units | Used in | Notes |
|-----|---------|-------|---------|-------|
| `BASE_DATE` | `new Date(1177, 3, 3)` | JS Date | astronomyCalc | Epoch (see model) |
| `SUN.MEAN_MOTION_PER_DAY` | `{0 °,59′,8″}` | deg/min/sec | astronomyCalc | Mean Sun motion |
| `SUN.START_POSITION` | `0,0,0` | deg/min/sec | astronomyCalc | Mean Sun λ at epoch |
| `SUN.APOGEE_START` | `26 °,45′,8″` | deg/min/sec | astronomyCalc | Rambam value |
| `SUN.APOGEE_MOTION_PER_DAY` | `1.5″` | arc-sec/day | astronomyCalc | 1½″/day |
| `MASLUL_CORRECTIONS` | table | deg | astronomyCalc | Piecewise linear |
| `MOON.MEAN_MOTION_PER_DAY` | `13 °,10′,35″` | deg/min/sec | astronomyCalc |
| `MOON.MEAN_LONGITUDE_AT_EPOCH` | `0` | deg | astronomyCalc | **Must be 0** |
| `MOON.MASLUL_MEAN_MOTION` | `13 °,3′,54″` | deg/min/sec | astronomyCalc | "Anomaly of the Moon" |
| `NODE_REGRESSION_DEG_PER_DAY` | `−0.0529538` | deg/day | astronomy.js | Ascending node |
| `MOON_PHASES` | map | deg range | astronomyCalc / UI | Textual phase mapping |
| _etc._ |  |  |  | See file for full list |

*The tables for galgalim radii & revolution periods are presently unused by the
render code but retained for future expansion.*

---

### How to change a constant safely

1. Edit `src/constants.js`.
2. Restart the dev-server (`npm start`) — Vite/Webpack hot reload does not
   always pick up nested constant changes.
3. Verify in the debug panel ("Position Data") that values update as expected. 