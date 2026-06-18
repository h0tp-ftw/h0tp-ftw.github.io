# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What This Is

Static portfolio site for h0tp-ftw, hosted on GitHub Pages. No build tools, no frameworks — plain HTML/CSS/JS. Two distinct areas:

- **Root (`/`)** — Main portfolio: hero, GitHub projects, starred repos discovery, swing trading chart, followed users
- **`/niche/`** — Blog/guides/tools hub with self-contained HTML posts

## Development

Serve locally with any static server:
```
python -m http.server 8080
```

No build step. No package.json. No tests. Validate changes by opening in a browser.

Deploy is git-push to `main` — GitHub Pages serves it automatically.

## Architecture

**Main page (`index.html` + `assets/port-logic.js` + `assets/styles.css`)**
- `port-logic.js` (~1300 lines) drives the page: GitHub data loading (repos, stars, following), Chart.js portfolio rendering, scroll handling, theme toggle, rotating text animation. Two helper scripts load **before** it (classic scripts sharing global scope): `site-config.js` (editable data — rotating words, project logos, language icons) and `vanilla-tilt.js` (vendored 3D-tilt library)
- GitHub data is read **snapshot-first**: `loadSnapshot()` fetches `assets/data/{repos,starred,following}.json`; the live unauthenticated API (60 req/hr) is only a fallback when a snapshot is missing/empty
- Data flows: `assets/data/*.json` (or live GitHub API fallback) → JS DOM injection, `portfolio-returns.csv` → Chart.js
- Starred repos: the snapshot holds the full list, so "Show All Stars" needs no extra calls; the live fallback still fetches page-by-page
- Cool People bios: come from the `following` snapshot; the live fallback lazy-fetches them per-user when the section scrolls into view

**GitHub data snapshots (`assets/data/` + `.github/`)**
- `.github/scripts/snapshot.py` (Python stdlib, no deps) fetches the public GitHub data and writes the trimmed JSON arrays the main page consumes
- `.github/workflows/snapshot-github-data.yml` runs it daily + on manual dispatch using the Actions `GITHUB_TOKEN` (5000 req/hr), then commits any changes back to `main`
- Reseed locally: `python3 .github/scripts/snapshot.py` (works unauthenticated; set `GH_TOKEN` to raise the limit, `GH_USER` to target another account)
- Requires repo Settings → Actions → General → Workflow permissions = "Read and write"

**Blog system (`/niche/`)**
- `blog-base.js` auto-injects shared chrome: animated background, theme toggle, back button, footer, `copyCode()` helper
- Posts are standalone HTML files — just add `<script src="assets/blog-base.js"></script>` in `<head>` and write content inside `<div class="niche-container">`
- `projects.json` is the blog index metadata (title, description, icon, tag, date, file path)
- `guide-breathtaking.css` is the shared blog stylesheet (includes cmd-block, method-tabs, step-items, feature-grid components)
- `guide-modern.css` adds sidebar TOC layout (used by gemini-cli-advanced)
- Interactive tools (twr-calculator, pokemon-trading-tool) have their own CSS/JS

## Key Conventions

**Theming:** Catppuccin Frappé (dark, default) / Latte (light). CSS variables are `--ctp-*` (e.g. `--ctp-mauve`, `--ctp-base`). Theme persists via `localStorage.getItem('theme')`. Both `styles.css` and `guide-breathtaking.css` define the full color sets independently.

**Performance rules already in place:**
- `backdrop-filter` disabled on mobile (<768px) and on section-level elements
- VanillaTilt skipped on touch devices
- Scroll handlers throttled via single `requestAnimationFrame` loop
- Images in dynamically-created cards use `loading="lazy"`
- Chart.js loaded with `defer`

**CSS structure in `styles.css`:** Organized in labeled sections (theme variables → global → background → navigation → hero → sections → cards → responsive → performance). Accent colors use `--accent` which maps to `--ctp-mauve` (dark) or `--ctp-blue` (light).

## Adding a New Blog Post

1. Create `niche/your-post.html` with this minimal structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Your Title | h0tp-ftw</title>
       <link rel="stylesheet" href="assets/guide-breathtaking.css">
       <script src="assets/blog-base.js"></script>
   </head>
   <body data-theme="frappe">
       <div class="niche-container">
           <header class="niche-header">
               <h1><span class="gradient-text">Your Title</span></h1>
               <p class="niche-subtitle">Description here</p>
           </header>
           <div class="guide-content">
               <section><!-- your content --></section>
           </div>
       </div>
   </body>
   </html>
   ```
2. Add an entry to `niche/projects.json`

## External Dependencies (CDN)

- **Chart.js** — portfolio performance chart
- **Devicons** — language icons on project cards
- **Google Fonts** — Inter, Outfit, Fira Code
