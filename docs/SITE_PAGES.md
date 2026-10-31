# Microbot site pages: how every page is built

One look for themicrobot.com, the plugins list and the Plugin Hub pages (chsami.github.io/Microbot-Hub), taken from
the Microbot Launcher's theme. New pages start from `docs/page-template.html` and get the look by linking two files.

## Files

| File | What | Used by |
|---|---|---|
| `microbot/mb-theme.css` | Tokens (launcher colours, fonts), base, header, footer, buttons, cards, chips, cookie banner, launcher mode | every page, Hub pages load it from themicrobot.com |
| `microbot/mb-site.js` | Menu toggle, cookie consent + Analytics, Releases NEW badge, launcher mode, `MB.el`, `MB.countUp` | every page |
| `microbot/mb-home.css`, `mb-plugins.css` | Page-only styles | index.html, plugins.html |
| Hub: `_layouts/default.html`, `_includes/header.html`, `_includes/footer.html`, `assets/css/hub.css` | Plugin pages | Microbot-Hub `public/docs/` |

Change a colour or the header once in `mb-theme.css` and every page follows, including the Hub pages.

## Page contract (do not break: the launcher depends on it)

The launcher (Microbot-Launcher `renderer.js` `loadLandingPageWebview`) opens `https://www.themicrobot.com?source=launcher`
in a webview about 500-880px wide and, on themicrobot.com pages, runs:

| Selector | Launcher does |
|---|---|
| `body > header > div.c-events-block.py-2 > div` | removes it |
| `body > header > div.c-border-red.mb-2` | removes it |
| `#cookie-banner` | removes it |
| `body > header > nav > div` | sets max-width 100% |
| `body > main > section.c-main-header.c-main-header--home.py-5.d-flex.flex-column.justify-content-center` (home only) | sets min-height 600px |

So every page keeps: `<html class="mb">`, `<header class="c-header">` as a direct child of `<body>` with, in order,
`div.c-events-block.py-2 > div`, `div.c-border-red.mb-2`, `nav > div`; `#cookie-banner` on themicrobot.com pages; and
the home hero section with exactly those classes as a direct child of `<main>`. The utility classes (`py-5`, `d-flex`, ...)
style nothing any more; they stay only so the selectors still match.

`?source=launcher` adds `html.mb-in-launcher` (before first paint on the home page): the header stops being sticky, the
strip hides, the home download buttons are replaced by Browse plugins / What's new, and the cookie banner never shows.

## Check before publishing

Serve the repo root (`python -m http.server 8000`) and open `docs/launcher-check.html`:
`?page=<file>` for any page, `?w=500` for the narrowest launcher window. The tab title says PASS or FAIL; the bar lists
each selector found, sideways scroll, launcher mode and (home) the download buttons. Keep its selector list in step
with `renderer.js`.

## Adding a page

1. Copy `docs/page-template.html` to the site root, set the title, description and `aria-current` on its nav item.
2. Put page-only styles in `microbot/mb-<page>.css`; use the tokens (`var(--gold)` ...), never raw colours.
3. Run `launcher-check.html?page=<file>` at both widths.
