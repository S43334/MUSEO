import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

const BUCKET_BY_KIND: Record<string, string> = {
  original: 'artworks-original',
  web: 'artworks-web',
  thumb: 'artworks-thumb'
};

const DEFAULT_PRIVATE_ROOM_SLUG = 'mielito';
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 15;
const FAILED_AUTH_DELAY_MIN_MS = 400;
const FAILED_AUTH_DELAY_MAX_MS = 700;

type MediaRow = {
  artwork_id: string;
  kind: string;
  storage_path: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  mime_type?: string | null;
};

type SignedUrlEntry = {
  kind: string;
  path: string;
  signedUrl: string;
};

function readPrivatePassword(): string {
  const value = Deno.env.get('MUSEO_PRIVATE_PASSWORD');
  if (!value) {
    throw new Error('Missing env var: MUSEO_PRIVATE_PASSWORD');
  }
  return value;
}

function readPrivateRoomSlug(): string {
  return Deno.env.get('MUSEO_PRIVATE_ROOM_SLUG') || DEFAULT_PRIVATE_ROOM_SLUG;
}

function readSignedUrlTtlSeconds(): number {
  const raw = Number.parseInt(Deno.env.get('MUSEO_PRIVATE_SIGNED_TTL_SECONDS') || '', 10);
  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return DEFAULT_SIGNED_URL_TTL_SECONDS;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function delayFailedAuth() {
  const jitter = Math.floor(
    Math.random() * (FAILED_AUTH_DELAY_MAX_MS - FAILED_AUTH_DELAY_MIN_MS + 1)
  );
  await delay(FAILED_AUTH_DELAY_MIN_MS + jitter);
}

function buildMediaState() {
  return {
    original_path: null as string | null,
    original_url: null as string | null,
    original_width: null as number | null,
    original_height: null as number | null,
    web_path: null as string | null,
    web_url: null as string | null,
    web_width: null as number | null,
    web_height: null as number | null,
    thumb_path: null as string | null,
    thumb_url: null as string | null,
    thumb_width: null as number | null,
    thumb_height: null as number | null
  };
}

async function createSignedUrlLookup(
  supabase: ReturnType<typeof createServiceClient>,
  mediaRows: MediaRow[],
  signedTtlSeconds: number
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
        return [] as SignedUrlEntry[];
      }

      const bucket = BUCKET_BY_KIND[kind];
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(paths, signedTtlSeconds);

      if (error || !Array.isArray(data)) {
        return [] as SignedUrlEntry[];
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
        .filter(Boolean) as SignedUrlEntry[];
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

async function getRequestPassword(req: Request): Promise<string> {
  try {
    const parsed = await req.json();
    return String(parsed?.password || '');
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const expectedPassword = readPrivatePassword();
    const providedPassword = await getRequestPassword(req);

    if (!providedPassword || providedPassword !== expectedPassword) {
      await delayFailedAuth();
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    const privateRoomSlug = readPrivateRoomSlug();
    const signedTtlSeconds = readSignedUrlTtlSeconds();
    const expiresAt = new Date(Date.now() + (signedTtlSeconds * 1000)).toISOString();
    const supabase = createServiceClient();

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, slug, title, color, sort_order, is_published')
      .eq('slug', privateRoomSlug)
      .maybeSingle();

    if (roomError) {
      throw new Error(roomError.message);
    }

    if (!room?.id) {
      return jsonResponse({
        source: 'supabase-private',
        expires_at: expiresAt,
        rooms: [],
        artworks: []
      });
    }

    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, legacy_numeric_id, room_id, title, author, year, technique, description, theme_id, section_id, sort_order, is_published')
      .eq('room_id', room.id)
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

    const signedUrlLookup = await createSignedUrlLookup(supabase, mediaRows, signedTtlSeconds);
    const mediaByArtwork = new Map<string, ReturnType<typeof buildMediaState>>();

    for (const media of mediaRows) {
      const artworkId = String(media.artwork_id);
      const kind = String(media.kind || '');
      const storagePath = String(media.storage_path || '');
      if (!artworkId || !BUCKET_BY_KIND[kind] || !storagePath) {
        continue;
      }

      if (!mediaByArtwork.has(artworkId)) {
        mediaByArtwork.set(artworkId, buildMediaState());
      }

      const mediaState = mediaByArtwork.get(artworkId)!;
      const signedUrl = signedUrlLookup.get(`${kind}:${storagePath}`) || null;

      if (kind === 'original') {
        mediaState.original_path = storagePath;
        mediaState.original_url = signedUrl;
        mediaState.original_width = media.width ?? null;
        mediaState.original_height = media.height ?? null;
      } else if (kind === 'web') {
        mediaState.web_path = storagePath;
        mediaState.web_url = signedUrl;
        mediaState.web_width = media.width ?? null;
        mediaState.web_height = media.height ?? null;
      } else if (kind === 'thumb') {
        mediaState.thumb_path = storagePath;
        mediaState.thumb_url = signedUrl;
        mediaState.thumb_width = media.width ?? null;
        mediaState.thumb_height = media.height ?? null;
      }
    }

    const payloadArtworks = artworkList.map((artwork) => {
      const media = mediaByArtwork.get(String(artwork.id)) || buildMediaState();
      return {
        id: artwork.id,
        legacy_numeric_id: artwork.legacy_numeric_id,
        room_id: artwork.room_id,
        room_slug: room.slug,
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
      source: 'supabase-private',
      expires_at: expiresAt,
      rooms: [room],
      artworks: payloadArtworks
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected error'
    }, 500);
  }
});
