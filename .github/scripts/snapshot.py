#!/usr/bin/env python3
"""Snapshot public GitHub data for the site into assets/data/*.json.

Visitors' browsers would otherwise hit GitHub's unauthenticated API directly
(60 req/hr/IP), so the Projects / Discover / People sections break under any
real traffic. Instead, this script pre-fetches the data and the site reads the
static JSON (with the live API kept only as a fallback in port-logic.js).

Run nightly by .github/workflows/snapshot-github-data.yml using the Actions
GITHUB_TOKEN (5000 req/hr). Also runnable locally with no token (unauthenticated,
60 req/hr) to seed the files:  python3 .github/scripts/snapshot.py

Env:
  GH_USER   GitHub username (default: h0tp-ftw)
  GH_TOKEN  optional token; raises the rate limit (GITHUB_TOKEN also honored)

Writes assets/data/{repos,starred,following}.json as trimmed arrays matching
the shapes assets/port-logic.js consumes. All network fetches happen before any
file is written, so a transient failure aborts the run without clobbering a
previously good snapshot.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

USER = os.environ.get("GH_USER", "h0tp-ftw")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
API = "https://api.github.com"
OUT_DIR = os.path.join("assets", "data")


def api(path):
    """GET a GitHub API path and return parsed JSON, retrying transient errors."""
    url = path if path.startswith("http") else API + path
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": f"{USER}-site-snapshot",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(
                urllib.request.Request(url, headers=headers), timeout=30
            ) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            # Rate limited / server hiccup: wait for the reset (capped) and retry.
            if e.code in (403, 429, 500, 502, 503) and attempt < 2:
                reset = e.headers.get("X-RateLimit-Reset")
                wait = 5
                if reset:
                    wait = max(1, min(60, int(reset) - int(time.time()) + 1))
                print(f"  {e.code} on {url}; retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError(f"giving up on {url}")


def paginate(path, max_pages):
    """Collect up to max_pages of a paginated endpoint (100/page)."""
    items = []
    for page in range(1, max_pages + 1):
        sep = "&" if "?" in path else "?"
        data = api(f"{path}{sep}per_page=100&page={page}")
        if not data:
            break
        items.extend(data)
        if len(data) < 100:
            break
    return items


def trim_repo(r):
    """Keep only the repo fields port-logic.js renders."""
    return {
        "name": r.get("name"),
        "full_name": r.get("full_name"),
        "description": r.get("description"),
        "html_url": r.get("html_url"),
        "language": r.get("language"),
        "stargazers_count": r.get("stargazers_count", 0),
        "forks_count": r.get("forks_count", 0),
        "fork": bool(r.get("fork", False)),
        "owner": {"login": (r.get("owner") or {}).get("login")},
    }


def write_json(name, data):
    path = os.path.join(OUT_DIR, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"  wrote {path} ({len(data)} items)")


def main():
    mode = "authenticated" if TOKEN else "UNauthenticated (60 req/hr)"
    print(f"Snapshotting GitHub data for {USER} -- {mode}")

    # All repos owned by USER (this endpoint never returns anyone else's). Forks
    # are kept here, each carrying its `fork` flag; the site hides forks from the
    # Projects section by default and re-includes only those listed in
    # SHOWCASE_FORKS (assets/site-config.js).
    repos = [trim_repo(r) for r in paginate(f"/users/{USER}/repos?sort=updated", 5)]

    # Starred repos: the full list (powers "Show All Stars" with zero live calls).
    starred = [trim_repo(r) for r in paginate(f"/users/{USER}/starred", 20)]

    # Following: list + each profile's bio/name (best-effort, so one deleted
    # account can't fail the whole run). Order is preserved; the site shuffles.
    following = []
    for u in paginate(f"/users/{USER}/following", 5):
        name = bio = None
        try:
            detail = api(f"/users/{u['login']}")
            name, bio = detail.get("name"), detail.get("bio")
        except Exception as e:  # noqa: BLE001 - bios are an enhancement, never fatal
            print(f"  bio fetch failed for {u['login']}: {e}", file=sys.stderr)
        following.append({
            "login": u.get("login"),
            "html_url": u.get("html_url"),
            "avatar_url": u.get("avatar_url"),
            "name": name,
            "bio": bio,
        })

    # Only now that every fetch succeeded do we touch the files.
    os.makedirs(OUT_DIR, exist_ok=True)
    write_json("repos", repos)
    write_json("starred", starred)
    write_json("following", following)
    print("Done.")


if __name__ == "__main__":
    main()
