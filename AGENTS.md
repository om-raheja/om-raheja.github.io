# AGENTS.md

## What this is

Personal website + blog for Om Raheja, hosted at **omraheja.me**.  
Plain HTML/CSS — no JS bundler, no package manager, no CI/CD.

**Hosting (important, matches reality):**
- Live site is **Cloudflare Pages** (project `omraheja`, account `5ff27740…` = "Marktwaincafe@outlook.com's Account"), deployed via `npm run deploy:site` (`wrangler pages deploy . --project-name=omraheja --branch=main`).
- `functions/blog/[[path]].js` + `functions/_routes.json` put `/blog/*` behind a WorkOS login gate (sessions verified via `jose`; `ALLOWED_EMAILS`/`ADMIN_EMAILS` in `api/wrangler.toml` + `.env.work`). The homepage is public.
- Git pushes to `main` do **not** deploy — you must run `npm run deploy:site`. GitHub Pages/`CNAME` is a legacy mirror, not what serves traffic.
- Cloudflare api token for the site lives in `.env.local` (`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`). Set `CLOUDFLARE_API_TOKEN` when calling wrangler, or run `wrangler login`.

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
- **Trilingual posts**: a Hindi `post.md` plus English `post.en.md` build into three pages via `bb.sh trilingual post.md`: `post.html` (Hindi), `post.en.html` (English), `post-romanized.html` (Devanagari→Latin transliteration via `node blog/lang/cli.js print`). Satellites are excluded from index/tags/RSS.
- Tags stay identical across both `.md` files (three scripts, hyphenated, e.g. `ग़ौर-ओ-फ़िक्र, ghaur-o-fikr, reflection`); each becomes its own `tag_*.html` page.
- Site-wide chrome (title/description/author/footer) is per-language: `global_title/_en/_roman` etc. in `blog/.config`.
- Language picker: `blog/lang/lang.js` (site-wide header `<details class="lang-nav site-nav">` + per-post dropdown), remembers choice in `localStorage["blog.lang"]`, auto-opens on first visit.

## Commands

| Action | Command |
|---|---|
| Rebuild landing page from `index.md` | `./convert.sh` |
| Create/edit blog post | `blog/bb.sh post [file.md]` |
| Build a trilingual post | `cd blog && EDITOR=true ./bb.sh trilingual post.md` |
| Rebuild all blog pages | `blog/bb.sh rebuild` |
| List blog posts | `blog/bb.sh list` |
| List tags | `blog/bb.sh tags` |
| **Deploy to live** | `npm run deploy:site` (Cloudflare Pages project `omraheja`) |

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
 
