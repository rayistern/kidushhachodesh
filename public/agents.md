# For AI assistants & their users

This site exposes the Rambam's Kiddush HaChodesh calculations in a machine-
navigable way, so you can point any AI chat (Claude, ChatGPT, Perplexity, etc.)
at it and have a conversation about the underlying astronomy and halacha
without having to pre-load everything into context.

## How to use it

**If your AI supports MCP (Claude Desktop, claude.ai connectors, ChatGPT
developer-mode connectors, Cursor, etc.):** add this URL as an MCP server:

    https://<this-site>/mcp

It exposes three tools: `search`, `fetch`, and `calculate`.

**If your AI just browses the web (consumer ChatGPT with search, Claude with web
search, Perplexity, Gemini, …):** tell it:

> Browse <this-site> and read /llms.txt first — it is a map of the site written
> for you. Then answer my question, calling /api/calculate?date=YYYY-MM-DD for
> any specific date.

Either way it is the same URL. The model picks the door.

## What it knows

- Every step of the Rambam's sun, moon, and visibility calculations.
- The full set of constants (epoch, daily motions, table corrections).
- Calculations for any Gregorian date via `/api/calculate?date=…`.
- The docs in `/docs/*.md`.

## What it does NOT do (yet)

- No "use gallery" / submissions — that is phase 2 and will need a database.
- No per-user auth. Everything here is read-only and public.
