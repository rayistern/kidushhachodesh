export function getMoonIllumination(date) {
  // getMoonPhase should return a 0→1 fraction (0=new, 0.5=full)
  const phase = getMoonPhase(date);
  // Convert phase to lit fraction: (1 − cos(2π·phase))/2
  return (1 - Math.cos(phase * 2 * Math.PI)) / 2;
}