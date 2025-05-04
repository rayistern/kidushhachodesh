import { getMoonIllumination } from '../utils/dateUtils';

const illum = getMoonIllumination(date);      
// Map [0..1] → [minBright..maxBright] (in %)
const minBright = 30;      // e.g. very dark new-moon
const maxBright = 100;     // full-moon = white
const brightness = minBright + illum * (maxBright - minBright);
// a grey‐scale HSL
const moonFill = `hsl(0,0%,${brightness}%)`;

<circle 
  cx={moonX} 
  cy={moonY} 
  r={moonRadius} 
  fill="#888"   // or whatever grey you like 
/> 