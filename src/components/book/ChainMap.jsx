/**
 * ChainMap — the whole calculation, and where you are in it.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal UI (navigation / orientation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The reader asked to be able to keep a thread of thinking across
 * chapters. This is that thread made visible: the full run from
 * counting days to "can it be seen", with what the book has already
 * covered, what this chapter is, and what is still to come.
 *
 * Status comes from `content/book/chain.js` and is a pure function of
 * position in the book — see the note there on why it deliberately
 * makes no claim about what the reader has understood.
 *
 * The three status words are printed as headings rather than left to a
 * colour code, because a legend of coloured dots is not self-evident
 * and this component's whole job is orientation.
 *
 * Nodes whose chapter has no book text yet link to the source reader
 * instead, so the map is complete and truthful while the book is still
 * being written.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAIN_NODES, chainStatus, nodeIndex } from '../../content/book/chain';
import { hasBookChapter } from '../../content/book';

const STATUS_ORDER = ['settled', 'current', 'here', 'ahead'];

const GROUP_LABEL = {
  settled: 'Already covered',
  current: 'You are here',
  ahead: 'Still to come',
};

/** Where a node should link: the book if written, else the source text. */
function hrefFor(node) {
  return hasBookChapter(node.chapter) ? `/book/${node.chapter}` : `/text/${node.chapter}`;
}

export default function ChainMap({ currentChapter, activeNodeId = null, variant = 'rail' }) {
  const [expanded, setExpanded] = useState(false);

  const rows = CHAIN_NODES.map((node) => ({
    node,
    status: chainStatus(node, currentChapter, activeNodeId),
  }));

  if (variant === 'full') {
    return <FullMap rows={rows} />;
  }

  const active =
    rows.find((r) => r.status === 'here') || rows.find((r) => r.status === 'current') || rows[0];

  return (
    <>
      {/* Mobile: a compact bar that expands. The rail would eat the
          screen on a phone, but losing the thread is exactly the
          problem this component exists to solve, so it stays present
          in miniature rather than disappearing under a breakpoint. */}
      <div className="lg:hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left"
        >
          <span className="shrink-0 font-mono text-[10px] text-[var(--color-text-secondary)]">
            {nodeIndex(active.node.id)}/{CHAIN_NODES.length}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs">{active.node.label}</span>
          <Pips rows={rows} />
          <span className="shrink-0 text-[10px] text-[var(--color-text-secondary)]">
            {expanded ? '▲' : '▼'}
          </span>
        </button>
        {expanded && (
          <div className="mt-2 max-h-[60dvh] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <NodeList rows={rows} onNavigate={() => setExpanded(false)} />
          </div>
        )}
      </div>

      {/* Desktop: a sticky rail alongside the chapter. */}
      <nav
        className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
        aria-label="Where this chapter sits in the whole calculation"
      >
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
          The whole calculation
        </div>
        <NodeList rows={rows} />
      </nav>
    </>
  );
}

/** Twelve dots — the chain at a glance, for the mobile bar. */
function Pips({ rows }) {
  return (
    <span className="flex shrink-0 gap-[2px]" aria-hidden="true">
      {rows.map(({ node, status }) => (
        <span
          key={node.id}
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'ahead'
              ? 'bg-[var(--color-border)]'
              : status === 'settled'
                ? 'bg-[var(--color-gold)] opacity-60'
                : 'bg-[var(--color-accent)]'
          }`}
        />
      ))}
    </span>
  );
}

function NodeList({ rows, onNavigate }) {
  // Group headings are emitted when the status band changes, so the
  // reader gets "Already covered / You are here / Still to come" as
  // words rather than having to decode a colour.
  let lastBand = null;

  return (
    <ol className="space-y-0.5">
      {rows.map(({ node, status }) => {
        const band = status === 'here' ? 'current' : status;
        const heading = band !== lastBand ? GROUP_LABEL[band] : null;
        lastBand = band;

        return (
          <React.Fragment key={node.id}>
            {heading && (
              <li
                className="pb-0.5 pt-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] first:pt-0"
                aria-hidden="true"
              >
                {heading}
              </li>
            )}
            <li>
              <Link
                to={hrefFor(node)}
                onClick={onNavigate}
                aria-current={status === 'here' || status === 'current' ? 'step' : undefined}
                aria-label={`${node.label} — chapter ${node.chapter}, ${
                  status === 'ahead' ? 'still to come' : status === 'settled' ? 'already covered' : 'you are here'
                }`}
                className={`flex gap-2 rounded px-2 py-1 transition-colors hover:bg-[var(--color-card)] ${
                  status === 'here' ? 'border-l-2 border-[var(--color-accent)]' : ''
                } ${status === 'ahead' ? 'opacity-50' : ''}`}
              >
                <span className="mt-[5px] shrink-0" aria-hidden="true">
                  <Dot status={status} />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[11px] leading-snug ${
                      status === 'current' || status === 'here'
                        ? 'font-bold text-[var(--color-text)]'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {node.label}
                  </span>
                  {node.hebrew && (
                    <span className="hebrew-text block text-[11px] leading-snug text-[var(--color-accent)] opacity-80">
                      {node.hebrew}
                    </span>
                  )}
                  <span className="block font-mono text-[9px] text-[var(--color-text-secondary)] opacity-70">
                    ch {node.chapter}
                    {!hasBookChapter(node.chapter) && ' · source text'}
                  </span>
                </span>
              </Link>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

function Dot({ status }) {
  if (status === 'settled') {
    return <span className="block h-2 w-2 rounded-full bg-[var(--color-gold)]" />;
  }
  if (status === 'ahead') {
    return (
      <span className="block h-2 w-2 rounded-full border border-[var(--color-text-secondary)]" />
    );
  }
  return (
    <span className="block h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30" />
  );
}

/** The wide form used on the book's front page, where it is the contents. */
function FullMap({ rows }) {
  let lastChapter = null;
  return (
    <ol className="space-y-1">
      {rows.map(({ node, status }) => {
        const newChapter = node.chapter !== lastChapter;
        lastChapter = node.chapter;
        return (
          <li key={node.id}>
            <Link
              to={hrefFor(node)}
              className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 transition-colors hover:border-[var(--color-accent)]"
            >
              <span className="w-10 shrink-0 pt-0.5 text-center font-mono text-[10px] text-[var(--color-text-secondary)]">
                {newChapter ? `ch ${node.chapter}` : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{node.label}</span>
                <span className="block text-[11px] text-[var(--color-text-secondary)]">
                  {node.blurb}
                </span>
              </span>
              {node.hebrew && (
                <span className="hebrew-text shrink-0 text-xs text-[var(--color-accent)]">
                  {node.hebrew}
                </span>
              )}
              {!hasBookChapter(node.chapter) && (
                <span className="shrink-0 rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[9px] text-[var(--color-text-secondary)]">
                  source only
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
