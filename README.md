# X3 Growth Intelligence for Claude

Claude plugin marketplace for [X3 Growth Intelligence](https://intelligence.x3growth.io) – cookieless
first-party analytics, ad-cost attribution and server-side conversions.

The plugin **`x3`** contains:

| Part | What it does |
|---|---|
| Skill `x3-connect-website` | Lets Claude do the complete job of connecting a website to X3: pick or create the project, install the SDK or script tag in your codebase (Next.js, React, Astro, plain HTML, WordPress, Shopify, Webflow, Google Tag Manager, …), wire your cookie banner/CMP, track forms, bookings, WhatsApp/phone/mail clicks, quizzes, CTAs and videos, add server-side lead and conversion calls, verify that data arrives, and set up goals, conversions and presets. Connecting Meta/Google ad accounts or operating the dashboard happens **only when you explicitly ask**. |
| MCP server `x3` | `https://api.x3growth.io/mcp` (Streamable HTTP, OAuth sign-in) – the X3 tools, docs and prompts the skill uses. |

The skill holds only the workflow, decisions, safety rules and verification steps. All concrete code,
APIs and options come from the live X3 documentation
([llms.txt](https://api.x3growth.io/llms.txt), MCP tools `docs_search`/`docs_read`/`setup_get_prompt`),
so it stays correct as X3 evolves.

## Install

### claude.ai, Claude Desktop and Cowork

1. Open [Customize › Plugins](https://claude.ai/customize/plugins) → **Add** → **Add marketplace**.
2. Enter `X3Growth/x3-claude` and add it, then install the plugin **x3**.
3. Open the plugin's **Connectors** tab and connect **x3** (sign in with your X3 account).

Alternatives:
- **Add › Upload plugin** with [`x3-plugin.zip`](https://intelligence.x3growth.io/downloads/x3-plugin.zip).
- Skill only: [Customize › Skills](https://claude.ai/customize/skills) → **+** → **Upload a skill** with
  [`x3-connect-website.zip`](https://intelligence.x3growth.io/downloads/x3-connect-website.zip)
  (code execution must be enabled). Add the X3 connector separately via "Zu Claude hinzufügen" in the X3 dashboard.
- Team/Enterprise: an Owner can provide the plugin for everyone (Organization settings › Plugins & skills),
  as installed by default or required.

### Claude Code

```bash
claude plugin marketplace add X3Growth/x3-claude
claude plugin install x3@x3growth
```

or inside a session: `/plugin marketplace add X3Growth/x3-claude`, then `/plugin install x3@x3growth`.
Sign in to the X3 server with `/mcp`. Run the skill with `/x3:x3-connect-website` or just ask
"Connect this site to X3".

If you already added the X3 server manually (`claude mcp add … x3 …`), remove one of the two
(`claude mcp remove x3`) so the tools are not listed twice.

### Only the X3 connector?

Connector users get the same guidance without installing anything: the X3 MCP server offers the prompt
**`connect_website`** and the resource `x3://skills/x3-connect-website/SKILL.md`.

## Deutsch – Kurzanleitung

- **claude.ai / Desktop:** [Customize › Plugins](https://claude.ai/customize/plugins) → Add → Add marketplace →
  `X3Growth/x3-claude` → Plugin **x3** installieren → im Tab *Connectors* **x3** verbinden.
- **Claude Code:** `claude plugin marketplace add X3Growth/x3-claude` und `claude plugin install x3@x3growth`,
  dann `/mcp` zum Anmelden.
- Danach einfach schreiben: „Verbinde meine Website mit X3." Claude richtet Projekt, Tracking, Cookie-Banner,
  Events, Server-Conversions, Ziele und Presets ein und prüft, ob Daten ankommen. Werbekonten verbindet
  Claude nur, wenn du das ausdrücklich möchtest – und ändert dort nie etwas.

## Development

This repository is published from the private X3 monorepo (`packages/claude/marketplace`); pull
requests are welcome and are ported back. Check the files with:

```bash
node scripts/validate.mjs           # frontmatter, names, links, JSON manifests
claude plugin validate . && claude plugin validate plugins/x3
```

License: [MIT](LICENSE)
