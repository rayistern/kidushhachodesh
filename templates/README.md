# Starter templates

Small, copy-pasteable scaffolds that use the Kiddush HaChodesh calculation
engine. Designed for AI assistants (Claude, ChatGPT) to fetch, modify, and
hand the user as a working artifact — but humans can use them directly too.

All templates import the engine **live** from the project's deployment, so
there is no build step and no install. If you want to self-host, change the
base URL at the top of each file.

## Templates

| File | What it is |
|---|---|
| [`standalone-calculator.html`](./standalone-calculator.html) | Single HTML file. Date picker + full pipeline output. Drop into any browser or paste into a Claude Artifact. |
| [`node-cli.mjs`](./node-cli.mjs) | Node 18+ CLI. `node node-cli.mjs 2026-04-07`. Uses dynamic `import()` from the live engine. |

## How an AI should use these

1. Fetch the template you want via `/templates/<name>` or the MCP `get_template` tool.
2. Modify it for the user's request (different styling, different fields, chart library, etc.).
3. Hand the user the modified file as an artifact.

The live engine is documented at [`/docs/BUILDING_WITH_THE_ENGINE.md`](../docs/BUILDING_WITH_THE_ENGINE.md).

## License

MIT. Fork freely. If you use Rabbi Zajac's teaching content (class transcripts),
credit Rabbi Zajac and link to [Chabad.org](https://www.chabad.org).
