# Astronomical Model

*Target accuracy*: 1–2 ° in longitude for the Sun & Moon over a few centuries.
Enough for **calendar and visibility work**, not eclipse prediction.

---

## 1 . Epoch (“Day-Zero”)  
The Rambam and the traditional *Molad-Tohu* system both **define the epoch as a
conjunction**:

| Quantity | Value | Reasoning |
|----------|-------|-----------|
| Julian calendar | 3 April 1177 CE (noon local) | Convenient medieval epoch used in Rambam MSS. |
| Mean Sun λ☉ | 0° (start of Aries) | Rambam, Hil. K.H. 11:6 |
| Mean Moon λ☾ | 0° (same as Sun) | “…when the Sun entered Aries, the Moon was with it.” |

Consequence: every mean longitude constant at the epoch is **0 °**.

---

## 2 . Mean motions  

| Body | Daily motion (deg min sec) | Source |
|------|---------------------------|--------|
| Sun  | 0 ° 59′ 8⅓″              | Rambam K.H. 11:6 |
| Moon | 13 ° 10′ 35″ 4⁄30        | Rambam K.H. 11:7 |

In code (`src/constants.js`) we store them as  
`{ degrees, minutes, seconds }` and compute 