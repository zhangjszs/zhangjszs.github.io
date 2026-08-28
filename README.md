# HUAT Showcase

A curated portfolio site for the coursework in
[kerwin-lab/HUAT-kerwin-labwork](https://github.com/kerwin-lab/HUAT-kerwin-labwork),
built with [Astro](https://astro.build) and deployed to Cloudflare Pages.

This site showcases 17 projects spanning algorithms, systems programming, web
development, machine learning, and embedded systems. Each project has its own
page with screenshots, code snippets, and links back to the source.

> **This project was extracted from
> [`HUAT-kerwin-labwork`](https://github.com/kerwin-lab/HUAT-kerwin-labwork) on
> 2026-08-28.** The course-materials monorepo remains the source of truth for
> the actual assignments; this repository only holds the presentation layer.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 6](https://astro.build/) (static output) |
| Content | MDX via `@astrojs/mdx` |
| Sitemap | `@astrojs/sitemap` |
| Diagrams | [Mermaid](https://mermaid.js.org/) (client-side render) |
| Syntax highlight | [Shiki](https://shiki.style/) (GitHub Dark theme, built into Astro) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com/) |
| Tooling | TypeScript (strict), Prettier, `astro check` |

No CSS framework, no client-side state library, no telemetry. The only
runtime JS ships when an MDX page embeds a Mermaid diagram.

---

## Local development

Requirements: **Node.js ≥ 22.12.0** (the version is pinned in `package.json`'s
`engines` field).

```bash
# Install dependencies
npm ci

# Start the dev server (http://localhost:4321)
npm run dev

# Type-check content collections + run astro check
npm run check

# Verify that every project MDX has its screenshots and code snippets on disk
npm run check-assets

# Format the codebase
npm run format:write

# Build for production (output: dist/)
npm run build

# Preview the production build locally
npm run preview
```

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Astro dev server with HMR |
| `npm run check` | TypeScript + content-collection validation |
| `npm run check-assets` | Warn on missing screenshots / oversized images |
| `npm run build` | Static build → `dist/` |
| `npm run format:check` | Verify Prettier formatting |
| `npm run format:write` | Apply Prettier formatting |
| `npm run ci` | Run all three CI checks in sequence |

---

## Project layout

```
huat-showcase/
├── src/
│   ├── components/        # Reusable .astro components
│   ├── content/           # Content collections (MDX)
│   │   ├── projects/      # 17 project pages, one MDX per course folder
│   │   └── deep-dives/    # 4 long-form write-ups
│   ├── content.config.ts  # Zod schemas for the collections
│   ├── i18n/              # EN string dictionary (data-i18n pattern)
│   ├── layouts/           # BaseLayout.astro
│   ├── pages/             # Routes (index, projects, deep-dives, 404)
│   └── styles/            # global.css
├── public/
│   ├── assets/            # Portraits, stock photos, themed backgrounds
│   ├── code-snippets/     # Source-code samples (real copies, mirrored from
│   │                       # the source monorepo at scaffolding time)
│   └── screenshots/       # Per-project preview images
├── scripts/
│   └── check-assets.mjs   # Validates MDX references against public/
├── .github/workflows/     # CI (this repo) + optional Pages deploy
├── astro.config.mjs       # Site URL + integrations
├── wrangler.toml          # Cloudflare Pages binding
└── package.json
```

### Content collections

Two collections, defined in [`src/content.config.ts`](src/content.config.ts):

- **`projects`** — one MDX file per project, frontmatter includes
  `title`, `description`, `repoPath` (the subfolder inside the source
  monorepo), `tags`, `tech`, `course`, `teamSize`, `year`, `highlights`,
  `screenshotsDir`, and optional `codeSnippets[]`.
- **`deep-dives`** — long-form technical write-ups, e.g.
  `maze-algorithms`, `red-congestion-control`, `ssm-architecture`,
  `titanic-feature-engineering`.

To add a new project, drop a new MDX into `src/content/projects/` and
optionally copy assets into `public/screenshots/<slug>/` and
`public/code-snippets/<slug>/`. Run `npm run check-assets` to validate.

---

## Deployment

Pushes to `main` trigger the CI workflow in
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), which runs format
check, `astro check`, and the production build.

Hosting is configured via [`wrangler.toml`](wrangler.toml):

```toml
name = "huat-showcase"
compatibility_date = "2026-04-26"
pages_build_output_dir = "dist"
```

To deploy to your own Cloudflare Pages project:

1. Fork or import this repo into Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `dist`.
4. Set the environment variable `NODE_VERSION` to `22` (or any
   `>=22.12.0`).
5. (Optional) Add an `ASSETS` binding in `wrangler.toml` if you want
   R2-backed assets.

---

## Acknowledgements

- The actual project source code lives in
  [kerwin-lab/HUAT-kerwin-labwork](https://github.com/kerwin-lab/HUAT-kerwin-labwork).
- Background imagery uses the Astro "Portfolio" template's themed
  backgrounds (`public/assets/backgrounds/`).
- The site started as the
  [Astro Portfolio starter](https://github.com/withastro/astro/tree/main/examples/portfolio)
  and was heavily customized.

---

## License

Coursework content belongs to its respective course instructors and
the author of the source code. The presentation layer (this repository)
is released under the same terms as the original `HUAT-kerwin-labwork`
monorepo.
