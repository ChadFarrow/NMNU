import { NextRequest, NextResponse } from 'next/server';
import { Album, Publisher } from '@/lib/types/album';
import { FeedManager } from '@/lib/feed-manager';
import { FeedParser } from '@/lib/feed-parser';
import dataService from '@/lib/data-service';
import { loadStaticAlbums, convertRSSAlbumToAlbum } from '@/lib/static-albums';
import { generateSlug } from '@/lib/url-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    
    const nameSlug = generateSlug(decodedName);
    
    console.log(`🏢 Looking for publisher: "${decodedName}" (slug: "${nameSlug}")`);
    
    // First, try to find a parsed publisher feed using DataService
    try {
      // Try matching by various identifiers
      const publisherId = decodedName.toLowerCase();
      const publisherData = await dataService.getPublisherData(publisherId);
      
      if (publisherData) {
        console.log(`✅ Found publisher feed via DataService: ${publisherData.feedId}`);
        
        const publisherInfo = publisherData.publisherInfo || {};
        const publisherItems = publisherData.publisherItems || [];
        
        // Convert RSSAlbums to Album format for response
        const albums: Album[] = publisherData.albums.map(convertRSSAlbumToAlbum);

        // Merge with albums from static-albums.json to include all albums by this artist
        const publisherName = publisherInfo.artist || publisherInfo.title || decodedName;
        try {
          const allStaticAlbums = loadStaticAlbums();
          if (allStaticAlbums.length > 0) {
            const existingTitles = new Set(albums.map(a => a.title.toLowerCase()));
            const additionalAlbums = allStaticAlbums.filter((album: Album) => {
              const artistSlug = generateSlug(album.artist);
              const matches = artistSlug === nameSlug || album.artist.toLowerCase() === publisherName.toLowerCase();
              return matches && !existingTitles.has(album.title.toLowerCase());
            });
            if (additionalAlbums.length > 0) {
              albums.push(...additionalAlbums);
              console.log(`➕ Merged ${additionalAlbums.length} additional albums from static data`);
            }
          }
        } catch (mergeError: any) {
          console.warn('⚠️ Could not merge static albums:', mergeError);
        }

        const publisher: Publisher = {
          name: publisherName,
          guid: publisherInfo.feedGuid || 'no-guid',
          feedUrl: publisherInfo.feedUrl || '',
          medium: publisherInfo.medium || 'publisher',
          albums: albums,
          albumCount: albums.length,
          firstAlbumCover: albums[0]?.coverArt
        };
        
        return NextResponse.json({
          publisher,
          publisherItems, // Include the remoteItems (RSS feeds) from the publisher feed
          lastUpdated: new Date().toISOString(),
          source: 'parsed-feed'
        });
      }
    } catch (error) {
      console.log(`⚠️ DataService lookup failed, trying fallback:`, error);
    }
    
    // Fallback: Try matching by feed ID or title from FeedManager
    try {
      const feeds = FeedManager.getActiveFeeds();
      const publisherFeeds = feeds.filter(feed => feed.type === 'publisher');
      
      const matchingFeed = publisherFeeds.find(feed => {
        const feedIdSlug = generateSlug(feed.id);
        const feedTitleSlug = generateSlug(feed.title);
        return feedIdSlug === nameSlug || 
               feedTitleSlug === nameSlug ||
               feed.id.toLowerCase() === decodedName.toLowerCase() ||
               feed.title.toLowerCase() === decodedName.toLowerCase();
      });
      
      if (matchingFeed) {
        console.log(`✅ Found publisher feed in FeedManager: ${matchingFeed.id}`);
        
        // Get parsed feed data
        const parsedFeed = FeedParser.getParsedFeedById(matchingFeed.id);
        
        if (parsedFeed && parsedFeed.parseStatus === 'success' && parsedFeed.parsedData) {
          const publisherInfo = parsedFeed.parsedData.publisherInfo || {};
          const publisherItems = parsedFeed.parsedData.publisherItems || [];
          
          const publisher: Publisher = {
            name: publisherInfo.artist || publisherInfo.title || matchingFeed.title,
            guid: 'no-guid',
            feedUrl: matchingFeed.originalUrl,
            medium: 'publisher',
            albums: [],
            albumCount: 0
          };
          
          return NextResponse.json({
            publisher,
            publisherItems, // Include the remoteItems (RSS feeds)
            lastUpdated: new Date().toISOString(),
            source: 'feed-manager'
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ FeedManager lookup failed, trying static albums:`, error);
    }
    
    // Final fallback: Load static albums data and group by artist
    try {
      const allAlbums = loadStaticAlbums();
      if (allAlbums.length > 0) {
        // Find albums by this publisher
        const publisherAlbums = allAlbums.filter((album) => {
          const artistSlug = generateSlug(album.artist);
          return artistSlug === nameSlug || album.artist.toLowerCase() === decodedName.toLowerCase();
        });

        if (publisherAlbums.length > 0) {
          // Get publisher info from first album
          const firstAlbum = publisherAlbums[0];
          const publisherInfo: Publisher = {
            name: firstAlbum.artist,
            guid: firstAlbum.publisher?.feedGuid || 'no-guid',
            feedUrl: firstAlbum.publisher?.feedUrl || '',
            medium: firstAlbum.publisher?.medium || 'music',
            albums: publisherAlbums
          };

          return NextResponse.json({
            publisher: publisherInfo,
            lastUpdated: new Date().toISOString(),
            source: 'static-albums'
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Static albums lookup failed:`, error);
    }
    
    // No publisher found
    return NextResponse.json(
      { error: 'Publisher not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching publisher:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publisher' },
      { status: 500 }
    );
  }
}