// Feature flag configuration
export const FEATURES = {
  LIGHTNING: process.env.NEXT_PUBLIC_ENABLE_LIGHTNING === 'true',
  BITCOIN_CONNECT: process.env.NEXT_PUBLIC_ENABLE_LIGHTNING === 'true',
  BOOSTS: process.env.NEXT_PUBLIC_ENABLE_LIGHTNING === 'true',
  NOSTR: process.env.NEXT_PUBLIC_ENABLE_LIGHTNING === 'true',
} as const;

// Helper functions
export const isLightningEnabled = () => FEATURES.LIGHTNING;
export const isBitcoinConnectEnabled = () => FEATURES.BITCOIN_CONNECT;
export const isBoostsEnabled = () => FEATURES.BOOSTS;
export const isNostrEnabled = () => FEATURES.NOSTR;

// Check if the site's Nostr identity is configured. This runs in the browser, so
// it can only look at the public npub; the nsec is server-only (SITE_NOSTR_NSEC,
// read by /api/nostr/publish). Anything NEXT_PUBLIC_ is inlined into the bundle.
export const isNostrKeysConfigured = () => {
  const npub = process.env.NEXT_PUBLIC_SITE_NOSTR_NPUB;
  return !!(npub && npub.trim());
};