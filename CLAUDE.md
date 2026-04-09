# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSS Music Site Template — a Next.js 15 (App Router) template for Lightning Network-powered Value4Value music platforms. Parses RSS feeds with audio enclosures, provides a full-featured audio player, and optionally supports Bitcoin Lightning payments, Nostr integration, and Podcasting 2.0 features. Designed to be deployed on Vercel as a GitHub template repo.

## Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run dev:lightning     # Dev with Lightning features enabled
npm run dev:basic         # Dev without Lightning features
npm run build             # Production build (runs prebuild RSS parsing first)
npm run lint              # ESLint (next/core-web-vitals)
npm run test-feeds        # Test RSS feed parsing
npm run deploy            # Version bump + deploy script
```

### Environment Setup

```bash
cp env.lightning.template .env.local   # Lightning-enabled dev
cp env.basic.template .env.local       # Music-only dev
```

Key env vars: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ENABLE_LIGHTNING` (controls all Lightning/Nostr/Boost features), `NEXT_PUBLIC_SITE_NOSTR_NSEC` (site Nostr identity).

## Architecture

### Data Flow

1. RSS feeds are listed in `data/feeds.json` (URLs or processed feed objects with metadata)
2. At build time, `scripts/build-rss-data.ts` runs as a prebuild step — it parses all feeds via `lib/rss-parser.ts` and writes static data to `public/static-albums.json` and `public/data/albums-with-colors.json`
3. At runtime, `lib/data-service.ts` (singleton `DataService`) serves album/feed data with a 15-minute cache, reading from static files on server and fetching from API on client
4. The client fetches albums via `lib/album-fetch-utils.ts` which cascades through: static-cached API → static file → live-parse API

### Feed System

- `lib/feed-manager.ts` / `lib/feeds-manager.ts` — feed CRUD, auto-discovery of album feeds from publisher feeds
- `lib/rss-parser.ts` — RSS XML parsing, extracts tracks, artwork, `podcast:value` tags, publisher info
- `lib/auto-feed-processor.ts` — automated feed processing pipeline
- Feed types: `album` (individual album RSS) and `publisher` (aggregates multiple albums)

### Feature Flag System

All Lightning/Nostr/Boost features are gated behind `NEXT_PUBLIC_ENABLE_LIGHTNING=true` via `lib/feature-flags.ts`. Use `isLightningEnabled()` to conditionally render Lightning components. When disabled, Lightning code is tree-shaken from the bundle.

### Context Providers (app/layout.tsx)

The app wraps children in this provider hierarchy:
```
LightningProvider → AudioProvider → BitcoinConnectProvider
```
- `contexts/AudioContext.tsx` — global audio playback state, playlist management
- `contexts/LightningContext.tsx` — Lightning enabled/disabled state
- `contexts/BitcoinConnectContext.tsx` — Bitcoin Connect wallet integration

### Routing

- `/` — main page with album grid, filtering (Albums/EPs/Singles/Publishers), sidebar, audio player
- `/album/[id]` — album detail page (dynamic route, uses slug from `lib/url-utils.ts`)
- `/publisher/[name]` — publisher page
- `/podcast` — podcast view
- `/boosts` — Nostr boost feed (requires site Nostr keys)
- `/about`, `/offline`, `/feed-validator` — utility pages

### API Routes (`app/api/`)

- `albums` — album data with caching
- `feeds`, `parsed-feeds`, `process-feeds` — feed management
- `publisher`, `publishers` — publisher data
- `proxy-image`, `proxy-video`, `optimized-images` — media proxying to avoid CORS
- `cache` — cache management
- `health` — health check

### Lightning/Payment Stack

- `lib/nwc-service.ts` — NWC (Nostr Wallet Connect, NIP-47) protocol
- `lib/webln-service.ts` — WebLN browser extension support
- `lib/lnurl-service.ts` — LNURL protocol support
- `lib/payment-recipient-utils.ts` — extracts payment splits from RSS `podcast:value` tags
- `lib/boost-metadata-utils.ts` — constructs Podcasting 2.0 boost metadata
- `lib/boost-to-nostr-service.ts` / `lib/zap-receipt-service.ts` — posts boosts to Nostr relays

### Chrome Polyfill

The `@getalby/bitcoin-connect` library requires `chrome.runtime` APIs. The app injects extensive chrome/browser polyfills in `app/layout.tsx` (inline scripts) and `next.config.js` (webpack BannerPlugin) to prevent "chrome is not defined" errors in non-extension contexts.

### PWA

Configured via `next-pwa` in `next.config.js` but currently disabled (`disable: true`). Service worker registration component exists at `components/ServiceWorkerRegistration.tsx`. PWA manifest generated at `app/manifest.ts`.

## Key Types

- `lib/types/album.ts` — `Track`, `Album`, `PaymentRecipient`, `PublisherInfo`
- `lib/types/boost.ts` — boost/payment types
- `lib/rss-parser.ts` — `RSSAlbum`, `RSSValue`, `RSSValueRecipient`

## Deployment

Primary deployment target is Vercel. The build process automatically parses RSS feeds during `prebuild`. GitHub Actions workflow (`.github/workflows/auto-version-pwa.yml`) handles auto-versioning.
