import {
  NODE_REGRESSION_DEG_PER_DAY
} from '../constants';

//  simple normalisation helper
const mod360 = deg => ((deg % 360) + 360) % 360;

/**
 *  Ascending-node (רֹאשׁ) longitude, counted in true zodiacal degrees,
 *  using Rambam's daily regression rate.
 *
 *  @param {Date} date           JS Date (UTC is fine – only relative days matter)
 *  @param {Date} epoch          reference epoch whose node-longitude is 0 (default = 1 Tishrei 5759 / ‏1998-09-21)
 *  @returns {number}            longitude in decimal degrees 0-360
 */
export function getAscendingNodeLongitude(date,
  epoch = new Date('1998-09-21T00:00:00Z')) {

  const days = (date.getTime() - epoch.getTime()) / 86_400_000; // ms in a day
  return mod360(days * NODE_REGRESSION_DEG_PER_DAY);
} 