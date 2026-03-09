# Cloudflare Mail Forge

A local web console for managing Cloudflare Email Routing rules in bulk — create, query, toggle, and delete routing rules across multiple domains from a single page.

![UI Preview](https://raw.githubusercontent.com/hengfengliya/Cloudflare-Mail-Forge/main/docs/preview.png)

---

## Why

The Cloudflare dashboard only lets you manage email routing rules one at a time. If you run multiple domains and need to create dozens of addresses pointing to the same inbox, it becomes tedious fast.

This tool collects all that into a single, local-only operations panel:

- **Batch create** — generate address patterns (prefix + index) or paste a manual list, applied to one or many domains at once
- **Multi-domain** — select any combination of zones; all batch operations write to every selected domain simultaneously
- **Query & manage** — search, filter, toggle enabled/disabled, and delete rules with checkboxes
- **Local-only** — binds to `127.0.0.1` only; your API token never leaves your machine

---

## Quick Start

**Requirements:** Node.js 18+, a Cloudflare API Token

```bash
git clone https://github.com/hengfengliya/Cloudflare-Mail-Forge.git
cd Cloudflare-Mail-Forge
node server.js
```

Open **http://127.0.0.1:3042** in your browser.

> No `npm install` needed — zero runtime dependencies.

---

## Getting a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → top-right avatar → **My Profile**
2. Left sidebar → **API Tokens** → **Create Token**
3. Choose **Custom token**, add these two permissions:
   - `Zone` → `Zone` → **Read**
   - `Zone` → `Email Routing Rules` → **Edit**
4. Under *Zone Resources*, select **Specific zone** and pick your domains (or choose *All zones*)
5. Create and copy the token — it's only shown once

---

## Usage

### Step 1 — Configure

Paste your API Token, set a destination email (all routes forward here), and configure defaults for prefix, count, and start index. Click **Save Config** — the domain list will load automatically.

### Step 2 — Select Domains

Check one or more domains. All batch operations in Step 3 will apply to every checked domain simultaneously. Use the search box to filter if you have many zones.

### Step 3 — Batch Create

**Pattern mode** — auto-generates addresses:

```
prefix=shop  count=3  start=1
→ shop001@domain.com
→ shop002@domain.com
→ shop003@domain.com
```

**Manual mode** — paste a list of local-parts (one per line):

```
sales
support
hello
```

Both modes write to all selected domains in one operation.

### Step 4 — Query & Manage

Select a domain from the dropdown to load its routing rules. Filter by address, destination, or rule name. Toggle or delete individual rules, or batch-delete with checkboxes.

---

## Environment Variables (optional)

Copy `.env.example` to `.env` to pre-fill defaults:

```bash
cp .env.example .env
```

| Variable              | Default     | Description                            |
|-----------------------|-------------|----------------------------------------|
| `PORT`                | `3042`      | Local server port                      |
| `HOST`                | `127.0.0.1` | Bind address                           |
| `CF_TOKEN`            | —           | Pre-fill API Token                     |
| `CF_DESTINATION`      | —           | Pre-fill destination email             |
| `CF_DEFAULT_PREFIX`   | —           | Pre-fill default prefix                |
| `CF_DEFAULT_COUNT`    | `5`         | Pre-fill default rule count            |
| `CF_DEFAULT_START`    | `1`         | Pre-fill default start index           |
| `CF_DELAY_MS`         | `0`         | Delay between batch requests (ms)      |

> **Security:** Config (including token) is stored in `data/app-config.json`. This file is in `.gitignore`. Never commit it.

---

## Project Structure

```
├── public/
│   ├── index.html      # Single-page UI
│   ├── styles.css      # Dark luxury design system
│   └── app.js          # Frontend logic
├── src/
│   ├── cloudflare.js   # Cloudflare API client
│   └── config-store.js # Local config persistence
├── data/               # Runtime config (gitignored)
├── legacy/             # Archived scripts (Python/PowerShell)
├── server.js           # Local HTTP server
├── .env.example        # Environment variable template
└── package.json
```

---

## Tech Stack

| Layer    | Choice                                        |
|----------|-----------------------------------------------|
| Server   | Node.js built-in `http` module — no framework |
| Frontend | Vanilla HTML / CSS / JS — no build step       |
| API      | Cloudflare Email Routing REST API             |
| Fonts    | Fraunces · IBM Plex Sans · IBM Plex Mono      |

---

## Security Notes

- The server only binds to `127.0.0.1` by default — not accessible from your local network
- Your API Token is stored locally in `data/app-config.json` (gitignored)
- No data is ever sent to any third-party service
- To run on a remote server, change `HOST` and ensure access control at the network level

---

## License

MIT — see [LICENSE](LICENSE)
