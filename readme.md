# Kidush Hachodesh

A React application for Hebrew calendar calculations.

> ### ⚠️ Known open ambiguity — molad timezone convention
>
> The molad-timeline tick marks are anchored from **BaHaRaD** (the Rambam's
> foundational molad, KH 6:8) forward by mean synodic months. That
> derivation requires picking a time zone for BaHaRaD's "day 2, hour 5,
> part 204" — the Rambam almost certainly meant **Jerusalem mean solar
> time** (roughly UT+2h21m, which is how traditional Hebrew-calendar
> tables publish molads), but the current code treats the civil time as
> **UT**. That introduces a **~2h offset** in where mean-molad tick marks
> fire on the timeline (`EPOCH_OFFSET_TO_FIRST_MOLAD` in
> `src/engine/moladTimeline.js`).
>
> **This does NOT affect** the astronomical engine — sun/moon longitudes,
> elongation, phase, visibility, and true-conjunction search are all
> unaffected. It only shifts the decorative mean-molad ticks on the
> visualization. If you're doing anything halachic with published molad
> times, add ~2h and/or re-anchor to a contemporary Hebrew-calendar
> reference; see the derivation comment in `src/engine/moladTimeline.js`.

## Prerequisites

- Node.js and npm should be installed on your machine. You can download them from [nodejs.org](https://nodejs.org/).

## Setup

1. Clone the repository or download the source code.

2. Navigate to the project directory in your terminal.

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your web browser and go to `http://localhost:3000` to view the application.

## Build

To create a production build of the application, run:

```bash
npm run build
```

## Scripts

- `npm start` — local dev server  
- `npm run build` — production build  
- `npm test` — run tests  

## Deploying to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket.  
2. Create a new site on Netlify "from Git" and point at your repo.  
3. Netlify build command: `npm run build`  
4. Publish directory: `build`  
5. (Optional) `netlify.toml` and `public/_redirects` are already configured.  
6. On each push to your main branch, Netlify will auto-deploy.
