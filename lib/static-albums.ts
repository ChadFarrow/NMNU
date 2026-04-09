import fs from 'fs';
import path from 'path';
import type { Album } from './types/album';

/**
 * Load albums from the pre-generated static-albums.json file.
 * Used by API routes that need album data without importing AlbumsService
 * (which pulls in sharp and crashes Vercel serverless functions).
 */
export function loadStaticAlbums(): Album[] {
  try {
    const staticPath = path.join(process.cwd(), 'public', 'static-albums.json');
    if (fs.existsSync(staticPath)) {
      const data = JSON.parse(fs.readFileSync(staticPath, 'utf8'));
      if (data && Array.isArray(data.albums)) {
        return data.albums;
      }
    }
  } catch (error) {
    console.error('Error reading static-albums.json:', error instanceof Error ? error.message : String(error));
  }
  return [];
}

/**
 * Convert an RSSAlbum (from parsed feed data) to the Album type used by API responses.
 */
export function convertRSSAlbumToAlbum(rssAlbum: any): Album {
  return {
    title: rssAlbum.title,
    artist: rssAlbum.artist,
    description: rssAlbum.description,
    coverArt: rssAlbum.coverArt || '',
    tracks: rssAlbum.tracks || [],
    releaseDate: rssAlbum.releaseDate,
    feedId: rssAlbum.feedId || '',
    feedUrl: rssAlbum.feedUrl,
    funding: rssAlbum.funding,
    value: rssAlbum.value,
    paymentRecipients: rssAlbum.paymentRecipients,
    publisher: rssAlbum.publisher,
    feedGuid: rssAlbum.feedGuid,
    publisherGuid: rssAlbum.publisherGuid,
    publisherUrl: rssAlbum.publisherUrl,
    imageUrl: rssAlbum.imageUrl,
  };
}
