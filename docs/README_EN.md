<div align="center">

# Cloudflare Mail Forge

A local web console for bulk management of Cloudflare Email Routing rules

**Batch create · Query · Toggle · Delete — across multiple domains at once**

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)]()

[中文](../README.md) · [GitHub](https://github.com/hengfengliya/Cloudflare-Mail-Forge)

</div>

---

## What is this

The Cloudflare dashboard only lets you manage email routing rules one at a time. If you run multiple domains and need to create dozens of forwarding addresses pointing to the same inbox, it becomes extremely tedious.

**Mail Forge** consolidates all of this into a single local page:

- **Batch create** — auto-generate address patterns (prefix + index) or paste a manual list, applied to all selected domains in one operation
- **Multi-domain** — select any combination of zones; batch operations write to every selected domain simultaneously
- **Query & manage** — search, filter, toggle enabled/disabled, and batch-delete with checkboxes
- **Local-only** — binds to `127.0.0.1` only; your API token never leaves your machine

---

## Quick Start

```bash
git clone https://github.com/hengfengliya/Cloudflare-Mail-Forge.git
cd Cloudflare-Mail-Forge
node server.js
```

Open **http://127.0.0.1:3042** in your browser.

> **Zero dependencies** — no `npm install` needed. Runs on Node.js built-in modules only.

---

## Getting a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → top-right avatar → **My Profile**
2. Left sidebar → **API Tokens** → **Create Token** → **Custom token**
3. Add these two permissions:
   - `Zone` → `Zone` → **Read**
   - `Zone` → `Email Routing Rules` → **Edit**
4. Under *Zone Resources*, select specific zones or choose *All zones*
5. Create and copy the token — it is only displayed once

---

## Usage

### Step 1 — Configure

Paste your API Token, set a destination email (all routes forward here), and configure defaults. Click **Save Config** — the domain list loads automatically.

### Step 2 — Select Domains

Check one or more domains. All batch operations in Step 3 will apply to every checked domain simultaneously.

### Step 3 — Batch Create

**Pattern mode** — auto-generates a sequence of addresses:

```
prefix=shop  count=3  start=1
→ shop001@domain.com
→ shop002@domain.com
→ shop003@domain.com
```

**Manual mode** — paste a list of local-parts (one per line). Accepts full email addresses too (automatically extracts the part before `@`).

### Step 4 — Query & Manage

Select a domain from the dropdown to load its routing rules. Search by address, destination, or rule name. Toggle or delete individual rules, or batch-delete with checkboxes.

---

## Environment Variables (optional)

Copy `.env.example` to `.env` to pre-fill defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3042` | Local server port |
| `HOST` | `127.0.0.1` | Bind address |
| `CF_TOKEN` | — | Pre-fill API Token |
| `CF_DESTINATION` | — | Pre-fill destination email |
| `CF_DEFAULT_PREFIX` | — | Pre-fill default prefix |
| `CF_DEFAULT_COUNT` | `5` | Pre-fill default count |
| `CF_DEFAULT_START` | `1` | Pre-fill default start index |
| `CF_DELAY_MS` | `0` | Delay between batch requests (ms) |

---

## Project Structure

```
├── public/
│   ├── index.html      # Single-page UI (with built-in help page)
│   ├── styles.css      # Dark precision design system
│   └── app.js          # Frontend logic
├── src/
│   ├── cloudflare.js   # Cloudflare API client
│   └── config-store.js # Local config persistence
├── docs/               # Documentation
├── data/               # Runtime config (gitignored)
├── legacy/             # Archived scripts (Python / PowerShell)
├── server.js           # Local HTTP server entry point
└── .env.example        # Environment variable template
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Server | Node.js built-in `http` — no framework |
| Frontend | Vanilla HTML / CSS / JS — no build step |
| API | Cloudflare Email Routing REST API |
| Fonts | Fraunces · IBM Plex Sans · IBM Plex Mono |

---

## Security

- Server binds to `127.0.0.1` by default — not accessible from your local network
- Config (including Token) is stored in local `data/app-config.json` (gitignored)
- No data is ever sent to any third-party service
- For remote server deployment, add your own access control at the network level

---

## License

[MIT](../LICENSE) © 2026 hengfengliya
