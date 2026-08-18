/**
 * SiteCredit — one shared credit line for the bottom of every reader
 * surface (/book, /text, /sky). This project began as a fork: the
 * engine and much of the site's logic come from
 * rayistern/kidushhachodesh. The credit is scoped deliberately: the
 * functions and logic are theirs; the plain-language book is not.
 */
import React from 'react';

export default function SiteCredit() {
  return (
    <footer className="mt-10 border-t border-[var(--color-border)] pt-4 pb-6 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
      Built on{' '}
      <a
        href="https://github.com/rayistern/kidushhachodesh"
        target="_blank"
        rel="noreferrer"
        className="text-[var(--color-accent)] hover:underline"
      >
        rayistern/kidushhachodesh
      </a>

      {' '}— the calculation engine and much of the underlying logic come from that project. The
      plain-language book and its figures were written here.
    </footer>
  );
}
