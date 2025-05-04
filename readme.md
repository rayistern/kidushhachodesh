# Kidush Hachodesh

A React application for Hebrew calendar calculations.

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
