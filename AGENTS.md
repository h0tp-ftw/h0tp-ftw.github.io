# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What This Is

Static portfolio site for h0tp-ftw, hosted on GitHub Pages. No build tools, no frameworks — plain HTML/CSS/JS.

- **Root (`/`)** — Main portfolio: hero, GitHub projects, starred repos discovery, swing trading chart, followed users
- **`/twr-calculator/`** — a standalone, **unlisted** time-weighted-return calculator (self-contained HTML + a local `guide-breathtaking.css`; intentionally not linked from the homepage)

## Development

Serve locally with any static server:
```
python -m http.server 8080
```

No build step. No package.json. No tests. Validate changes by opening in a browser.

Deploy is git-push to `main` — GitHub Pages serves it automatically.

## Architecture

**Main page (`index.html` + `assets/port-logic.js` + `assets/styles.css`)**
- `port-logic.js` (~1300 lines) drives the page: GitHub data loading (repos, stars, following), Chart.js portfolio rendering, scroll handling, theme toggle, rotating text animation. Two helper scripts load **before** it (classic scripts sharing global scope): `site-config.js` (editable data — rotating words, project logos, language icons, `PROJECT_IMPACTS`: per-repo impact blurbs, `SHOWCASE_FORKS`: forks to surface in Projects, and `HIDE_REPOS`: repos to drop entirely) and `vanilla-tilt.js` (vendored 3D-tilt library)
- GitHub data is read **snapshot-first**: `loadSnapshot()` fetches `assets/data/{repos,starred,following}.json`; the live unauthenticated API (60 req/hr) is only a fallback when a snapshot is missing/empty
- Data flows: `assets/data/*.json` (or live GitHub API fallback) → JS DOM injection, `portfolio-returns.csv` → Chart.js
- Starred repos: the snapshot holds the full list, so "Show All Stars" needs no extra calls; the live fallback still fetches page-by-page
- Cool People bios: come from the `following` snapshot; the live fallback lazy-fetches them per-user when the section scrolls into view

**GitHub data snapshots (`assets/data/` + `.github/`)**
- `.github/scripts/snapshot.py` (Python stdlib, no deps) fetches the public GitHub data and writes the trimmed JSON arrays the main page consumes (repos include a `fork` flag; the Projects section hides forks unless they're listed in `SHOWCASE_FORKS`)
- `.github/workflows/snapshot-github-data.yml` runs it daily + on manual dispatch using the Actions `GITHUB_TOKEN` (5000 req/hr), then commits any changes back to `main`
- Reseed locally: `python3 .github/scripts/snapshot.py` (works unauthenticated; set `GH_TOKEN` to raise the limit, `GH_USER` to target another account)
- Requires repo Settings → Actions → General → Workflow permissions = "Read and write"

## Key Conventions

**Theming:** Catppuccin Frappé (dark, default) / Latte (light). CSS variables are `--ctp-*` (e.g. `--ctp-mauve`, `--ctp-base`). Theme persists via `localStorage.getItem('theme')`. `styles.css` defines the full color sets; the standalone `/twr-calculator/` page carries its own copy in `guide-breathtaking.css`.

**Performance rules already in place:**
- `backdrop-filter` disabled on mobile (<768px) and on section-level elements
- VanillaTilt skipped on touch devices
- Scroll handlers throttled via single `requestAnimationFrame` loop
- Images in dynamically-created cards use `loading="lazy"`
- Chart.js loaded with `defer`

**CSS structure in `styles.css`:** Organized in labeled sections (theme variables → global → background → navigation → hero → sections → cards → responsive → performance). Accent colors use `--accent` which maps to `--ctp-mauve` (dark) or `--ctp-blue` (light).

## External Dependencies (CDN)

- **Chart.js** — portfolio performance chart
- **Devicons** — language icons on project cards
- **Google Fonts** — Inter, Outfit, Fira Code
