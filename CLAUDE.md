# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JavaScript landing page for Microbot, a free open-source RuneLite-based client. No build tools or frameworks - pure static files served directly.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Shared theme: `microbot/mb-theme.css`, `microbot/mb-site.js` (see `docs/SITE_PAGES.md`)
- Deployment: Azure Static Web Apps via GitHub Actions

## Development

**Local server** (no build step required):
```bash
python -m http.server 8000
```

**Deployment**: Push to `master` branch triggers automatic deployment via GitHub Actions.

## Key Directories

- `/microbot/` - Pre-built assets, minified CSS, fonts, release data
- `/docs/` - Markdown documentation (QUERYABLE_API.md)
- `/releases/` - Individual release note HTML files
- `/.specify/` - Speckit feature development templates

## Speckit Workflow

This project uses Speckit for structured feature development. Available skills:
- `/speckit.specify` - Create feature specifications
- `/speckit.plan` - Generate implementation plans
- `/speckit.tasks` - Create actionable task lists
- `/speckit.implement` - Execute implementation
- `/speckit.clarify` - Identify underspecified areas
- `/speckit.analyze` - Cross-artifact consistency check
- `/speckit.checklist` - Generate feature checklists

## Conventions

- Conventional commits: `feat:`, `docs:`, `fix:`, `chore:`
- Update `/docs/QUERYABLE_API.md` for API changes
- Add release notes to `/releases/` directory: copy the newest page there and replace its head metadata and `<main>`. Pages on the old template still render but keep the old header (see `docs/SITE_PAGES.md`)
- Main branch: `master`
