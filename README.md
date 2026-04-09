# NMNU (New Music Nudge Unit)

A Value4Value music platform showcasing Longy's catalog, powered by Bitcoin Lightning Network payments. Built with Next.js 15, featuring audio streaming from RSS feeds, Nostr integration, and Podcasting 2.0 support.

**Live site**: [nmnu.vercel.app](https://nmnu.vercel.app/)

Built from the [RSS-music-site-template](https://github.com/ChadFarrow/RSS-music-site-template).

## Features

- **RSS Feed Parsing**: 29 album feeds + 1 publisher feed from headstarts.uk and wavlake.com
- **Audio Streaming**: Full-featured audio player with playlist support
- **Lightning Payments**: Value4Value tips via WebLN, NWC (Nostr Wallet Connect), and LNURL
- **Nostr Integration**: Boost posting to Nostr relays with Podcasting 2.0 metadata
- **Publisher Feed System**: Dedicated pages for music publishers with artwork
- **Content Filtering**: Albums, EPs, Singles, and Publisher Feed views
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Responsive Design**: Optimized for all screen sizes

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   # For Lightning-enabled development
   cp env.lightning.template .env.local

   # OR for basic music-only development
   cp env.basic.template .env.local
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Adding Feeds

Edit `data/feeds.json` and add RSS feed URLs. Feeds are parsed automatically during build (`npm run build`) or can be tested with `npm run test-feeds`.

The [Podcast Index API](https://podcastindex.org/) can be used to discover feeds by artist or publisher.

## Deployment

Deployed to [Vercel](https://vercel.com). Pushes to `main` trigger automatic redeployment, which re-parses all RSS feeds during the build step.

### Environment Variables (set in Vercel dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_NAME` | Yes | Site display name |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full site URL |
| `NEXT_PUBLIC_ENABLE_LIGHTNING` | No | Enable Lightning payments (`true`/`false`) |
| `NEXT_PUBLIC_SITE_NOSTR_NSEC` | No | Site Nostr identity (nsec key) |
