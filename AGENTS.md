# AGENTS.md

## What this is

Personal website + blog for Om Raheja, hosted at **omraheja.me** (GitHub Pages via `CNAME`).  
Plain HTML/CSS — no JS bundler, no package manager, no CI/CD.

## Content pipelines

### Landing page (root)
- Source: `index.md` → build: `./convert.sh` (uses `lowdown`) → output: `index.html`
- `convert.sh` injects Google Analytics tag automatically

### Blog
- Source: `blog/*.md` → build: `blog/bb.sh` (bashblog v2.10) → output: `blog/*.html`
- Config: `blog/.config` overrides bashblog defaults
- Markdown engine: `blog/Markdown.pl` (Perl)
- RSS feed: `blog/feed.rss`
- Drafts go in `blog/drafts/`

## Commands

| Action | Command |
|---|---|
| Rebuild landing page from `index.md` | `./convert.sh` |
| Create/edit blog post | `blog/bb.sh post [file.md]` |
| Rebuild all blog pages | `blog/bb.sh rebuild` |
| List blog posts | `blog/bb.sh list` |
| List tags | `blog/bb.sh tags` |

## Quirks

- `clean.sh` is stale (references nonexistent `src/` dir) — do not use
- No test/lint/typecheck tooling
- Resumes are LaTeX at `use/Om-Raheja-Resume.tex`; compile via `tectonic`
- `convert.sh` runs from repo root, `bb.sh` runs from `blog/`
- Blog uses `Markdown.pl` (fallback if `lowdown` not available for landing page)

## Conventions

- Content is CC0-licensed (`LICENSE`)
- All work in `main` branch; push directly (no PR workflow)
- Site-wide styles in `style.css`; blog inherits it via `css_include` in `.config`
