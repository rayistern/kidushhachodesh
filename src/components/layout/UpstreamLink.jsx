/**
 * UpstreamLink — a link that is a client-side <Link> when the target
 * surface is hosted by this app, and a plain <a> when the Netlify build
 * points it at rayi's deployment (see lib/upstreamLinks.js).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { LINKS } from '../../lib/upstreamLinks';

export default function UpstreamLink({ href, className, children }) {
  return LINKS.external ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
