/**
 * upstreamLinks — where "the dashboard" and "the source reader" live.
 *
 * The Netlify book deploy does not present those two surfaces itself:
 * they are rayi's project, served at https://www.shluchimexchange.ai/kh.
 * Netlify's build injects VITE_UPSTREAM_BASE (netlify.toml,
 * [build.environment]); the local dev server and upstream's own builds
 * leave it unset, so for them every link stays an internal route and
 * nothing changes. netlify.toml also carries matching server-side
 * redirects for direct URL hits — this module only covers in-app links.
 */
export function buildLinks(base) {
  const b = (base || '').replace(/\/+$/, '');
  return {
    external: Boolean(b),
    dashboard: b ? `${b}/` : '/',
    text: (chapter) =>
      b
        ? chapter
          ? `${b}/text/${chapter}`
          : `${b}/text`
        : chapter
          ? `/text/${chapter}`
          : '/text',
  };
}

export const LINKS = buildLinks(import.meta.env.VITE_UPSTREAM_BASE);
