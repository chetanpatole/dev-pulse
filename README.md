# Dev Pulse — PWA (Phase 1)

An installable, mobile-first **Progressive Web App** that shows AI-curated
Shopify developer updates. This is the **Phase 1 reader**: it renders content
from a static `public/feed.json`, works offline, and installs to your home
screen. Push notifications come in Phase 2 (Firebase Cloud Messaging).

It's a fully independent project — the existing Telegram notifier is untouched.

## Stack
- **React + Vite**
- **vite-plugin-pwa** (manifest + service worker + offline caching)
- Design faithfully implemented from `DESIGN_BRIEF.md` + the design handoff
  (Figtree / JetBrains Mono, exact color tokens, light + dark).

## Views
- **Insight** (home) — the single most important item today (hero card).
- **Updates** — filterable feed (For you · type · hashtag).
- **Recap** — weekly themed digest with an action checklist.
- **Settings** — notifications toggle, editable stack, about.
- Plus first-run onboarding, offline banner, and empty/loading states.

## Run locally
```bash
npm install
npm run dev       # http://localhost:5173
```

## Build
```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build
```

## Deploy (GitHub Pages)
Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds with the correct base path (`/<repo>/`) and publishes `dist` to
GitHub Pages. Enable Pages → Source: **GitHub Actions**.

> Free GitHub Pages hosting requires a **public** repo.

## Data
The app reads `feed.json` at runtime:
```
{ meta: { lastSynced, generatedAt, repo },
  insight: {...}, updates: [...], recap: {...} }
```
Right now this is a committed sample. In a later step a generator
(`generate.py`, ported from the notifier) will produce it from the live feeds
on a schedule, and the deploy will refresh it.

## Roadmap
- **Phase 1 (this):** installable reader over `feed.json`, offline-capable. ✅
- **Phase 2:** Firebase Cloud Messaging push + Firestore token storage; a
  `generate.py` + cron to refresh `feed.json` with real content.
