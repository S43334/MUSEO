import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

const BUCKET_BY_KIND: Record<string, string> = {
  original: 'artworks-original',
  web: 'artworks-web',
  thumb: 'artworks-thumb'
};

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

type MediaRow = {
  artwork_id: string;
  kind: string;
  storage_path: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  mime_type?: string | null;
};

async function createSignedUrlLookup(
  supabase: ReturnType<typeof createServiceClient>,
  mediaRows: MediaRow[]
) {
  const pathsByKind: Record<string, string[]> = {
    original: [],
    web: [],
    thumb: []
  };

  for (const media of mediaRows) {
    const kind = String(media.kind || '');
    const storagePath = String(media.storage_path || '');
    if (!BUCKET_BY_KIND[kind] || !storagePath) {
      continue;
    }
    pathsByKind[kind].push(storagePath);
  }

  const uniquePathsByKind = Object.fromEntries(
    Object.entries(pathsByKind).map(([kind, paths]) => [kind, Array.from(new Set(paths))])
  ) as Record<string, string[]>;

  const signedUrlEntries = await Promise.all(
    Object.entries(uniquePathsByKind).map(async ([kind, paths]) => {
      if (paths.length === 0) {
        return [] as Array<{ kind: string; path: string; signedUrl: string }>;
      }

      const bucket = BUCKET_BY_KIND[kind];
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

      if (error || !Array.isArray(data)) {
        return [] as Array<{ kind: string; path: string; signedUrl: string }>;
      }

      return data
        .map((item: { path?: string; signedUrl?: string | null }) => {
          const path = String(item.path || '');
          const signedUrl = item.signedUrl || '';
          if (!path || !signedUrl) {
            return null;
          }

          return {
            kind,
            path,
            signedUrl
          };
        })
        .filter(Boolean) as Array<{ kind: string; path: string; signedUrl: string }>;
    })
  );

  const lookup = new Map<string, string>();
  for (const entries of signedUrlEntries) {
    for (const entry of entries) {
      lookup.set(`${entry.kind}:${entry.path}`, entry.signedUrl);
    }
  }

  return lookup;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, slug, title, color, sort_order, is_published')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    const roomList = rooms || [];
    const roomMap = new Map(roomList.map((room) => [room.id, room]));

    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, legacy_numeric_id, room_id, title, author, year, technique, description, theme_id, section_id, sort_order, is_published')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (artworksError) {
      throw new Error(artworksError.message);
    }

    const artworkList = artworks || [];
    const artworkIds = artworkList.map((artwork) => artwork.id);

    let mediaRows: MediaRow[] = [];
    if (artworkIds.length > 0) {
      const { data: media, error: mediaError } = await supabase
        .from('artwork_media')
        .select('artwork_id, kind, storage_path, width, height, bytes, mime_type')
        .in('artwork_id', artworkIds);

      if (mediaError) {
        throw new Error(mediaError.message);
      }

      mediaRows = (media || []) as MediaRow[];
    }

    const signedUrlLookup = await createSignedUrlLookup(supabase, mediaRows);
    const mediaByArtwork = new Map<string, Record<string, unknown>>();

    for (const media of mediaRows) {
      const artworkId = String(media.artwork_id);
      const kind = String(media.kind);
      const storagePath = String(media.storage_path || '');

      if (!mediaByArtwork.has(artworkId)) {
        mediaByArtwork.set(artworkId, {});
      }

      const mediaEntry = mediaByArtwork.get(artworkId)!;
      mediaEntry[`${kind}_path`] = storagePath;
      mediaEntry[`${kind}_url`] = signedUrlLookup.get(`${kind}:${storagePath}`) || null;
    }

    const payloadArtworks = artworkList.map((artwork) => {
      const room = roomMap.get(artwork.room_id);
      const media = mediaByArtwork.get(String(artwork.id)) || {};

      return {
        id: artwork.id,
        legacy_numeric_id: artwork.legacy_numeric_id,
        room_id: artwork.room_id,
        room_slug: room?.slug || null,
        title: artwork.title,
        author: artwork.author,
        year: artwork.year,
        technique: artwork.technique,
        description: artwork.description,
        theme_id: artwork.theme_id,
        section_id: artwork.section_id,
        sort_order: artwork.sort_order,
        image_web_url: media.web_url || null,
        image_thumb_url: media.thumb_url || null,
        image_original_url: media.original_url || null,
        media
      };
    });

    return jsonResponse({
      source: 'supabase',
      rooms: roomList,
      artworks: payloadArtworks
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected error'
    }, 500);
  }
});
