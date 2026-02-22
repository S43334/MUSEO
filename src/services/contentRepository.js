import { ARTWORKS, ROOMS } from '../museum/data.js';
import {
  fetchPublicCatalog,
  isBackendConfigured
} from './backendClient.js';

const PRIVATE_ROOM_SLUG = 'mielito';

function toNumericColor(value, fallback = 0x2f3f5a) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace('#', '');
    const numeric = Number.parseInt(normalized, 16);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return fallback;
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function computeArtworkDimensions(artwork) {
  const webWidth = toPositiveInt(artwork.media?.web_width);
  const webHeight = toPositiveInt(artwork.media?.web_height);
  const originalWidth = toPositiveInt(artwork.media?.original_width);
  const originalHeight = toPositiveInt(artwork.media?.original_height);
  const thumbWidth = toPositiveInt(artwork.media?.thumb_width);
  const thumbHeight = toPositiveInt(artwork.media?.thumb_height);

  const imageWidth = webWidth || originalWidth || thumbWidth || null;
  const imageHeight = webHeight || originalHeight || thumbHeight || null;
  const imageAspect = imageWidth && imageHeight ? (imageWidth / imageHeight) : null;

  return {
    imageWidth,
    imageHeight,
    imageAspect
  };
}

function normalizeBackendRooms(rawRooms = [], { privateRoomSlugs = new Set() } = {}) {
  return rawRooms
    .map((room, index) => {
      const slug = String(room.slug || room.id || '');
      if (!slug) {
        return null;
      }

      const sortOrder = room.sort_order ?? room.sortOrder ?? index;
      const isPrivateRoom = privateRoomSlugs.has(slug) || slug === PRIVATE_ROOM_SLUG;

      return {
        id: slug,
        slug,
        title: room.title || slug,
        themeIds: [slug],
        color: toNumericColor(room.color, 0x30405f),
        sortOrder,
        isPrivateRoom,
        sourceRoomId: room.id || null
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(({ sortOrder, ...room }) => room);
}

function toUrlOrNull(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function resolveArtworkImageSources(artwork) {
  const imageWebUrl = toUrlOrNull(artwork.image_web_url)
    || toUrlOrNull(artwork.media?.web_url);
  const imageOriginalUrl = toUrlOrNull(artwork.image_original_url)
    || toUrlOrNull(artwork.media?.original_url);
  const imageThumbUrl = toUrlOrNull(artwork.image_thumb_url)
    || toUrlOrNull(artwork.media?.thumb_url);
  const inlineImage = toUrlOrNull(artwork.image);

  const image = imageWebUrl
    || inlineImage
    || imageOriginalUrl
    || imageThumbUrl
    || '';

  return {
    image,
    imageWebUrl: imageWebUrl || inlineImage,
    imageOriginalUrl,
    imageThumbUrl
  };
}

function normalizeBackendArtworks(
  rawArtworks = [],
  normalizedRooms = [],
  { privateRoomSlugs = new Set() } = {}
) {
  const roomIds = new Set(normalizedRooms.map((room) => room.id));

  return rawArtworks
    .map((artwork, index) => {
      const roomSlug = artwork.room_slug || artwork.theme_id || artwork.themeId;
      if (!roomSlug || !roomIds.has(roomSlug)) {
        return null;
      }

      const legacyId = Number.parseInt(artwork.legacy_numeric_id, 10);
      const parsedId = Number.isFinite(legacyId)
        ? legacyId
        : Number.parseInt(artwork.id, 10);

      const imageSources = resolveArtworkImageSources(artwork);
      if (!imageSources.image) {
        return null;
      }

      const dimensions = computeArtworkDimensions(artwork);
      const sortOrder = artwork.sort_order ?? artwork.sortOrder ?? index;
      const isPrivateRoom = privateRoomSlugs.has(roomSlug) || roomSlug === PRIVATE_ROOM_SLUG;

      return {
        id: Number.isFinite(parsedId) ? parsedId : (index + 1),
        sourceArtworkId: artwork.id || null,
        title: artwork.title || 'Sin t\u00edtulo',
        file: artwork.file || '',
        author: artwork.author || 'Artista',
        image: imageSources.image,
        imageWebUrl: imageSources.imageWebUrl,
        imageOriginalUrl: imageSources.imageOriginalUrl,
        imageThumbUrl: imageSources.imageThumbUrl,
        imageWidth: dimensions.imageWidth,
        imageHeight: dimensions.imageHeight,
        imageAspect: dimensions.imageAspect,
        themeId: roomSlug,
        roomId: roomSlug,
        sectionId: artwork.section_id || artwork.sectionId || 'principal',
        sectionTitle: artwork.section_title || artwork.sectionTitle || 'Colecci\u00f3n principal',
        sectionColor: toNumericColor(artwork.section_color || artwork.sectionColor, 0x8a8a8a),
        year: artwork.year || 'Sin fecha',
        technique: artwork.technique || 'No especificada',
        description: artwork.description || 'Sin descripci\u00f3n adicional.',
        sortOrder,
        isPrivateRoom
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const bySort = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (bySort !== 0) {
        return bySort;
      }
      return a.id - b.id;
    });
}

function normalizeLocalArtworks(rawArtworks = []) {
  return rawArtworks.map((artwork) => ({
    ...artwork,
    roomId: artwork.themeId,
    imageWebUrl: artwork.image || null,
    imageOriginalUrl: artwork.imageOriginalUrl || null,
    imageThumbUrl: artwork.imageThumbUrl || null,
    imageWidth: artwork.imageWidth ?? null,
    imageHeight: artwork.imageHeight ?? null,
    imageAspect: artwork.imageAspect ?? null,
    sortOrder: artwork.sortOrder ?? artwork.id ?? 0,
    isPrivateRoom: false
  }));
}

function normalizePrivatePayload(privatePayload) {
  if (!privatePayload || typeof privatePayload !== 'object') {
    return null;
  }

  const rawRooms = Array.isArray(privatePayload.rooms) ? privatePayload.rooms : [];
  const rawArtworks = Array.isArray(privatePayload.artworks) ? privatePayload.artworks : [];

  if (rawRooms.length === 0 || rawArtworks.length === 0) {
    return {
      rooms: [],
      artworks: [],
      expiresAt: privatePayload.expires_at || null
    };
  }

  const privateRoomSlugs = new Set(
    rawRooms
      .map((room) => String(room?.slug || room?.id || '').trim())
      .filter(Boolean)
  );

  const rooms = normalizeBackendRooms(rawRooms, { privateRoomSlugs });
  const artworks = normalizeBackendArtworks(rawArtworks, rooms, { privateRoomSlugs });

  return {
    rooms,
    artworks,
    expiresAt: privatePayload.expires_at || null
  };
}

function mergeCatalogContent(baseContent, privateContent) {
  if (!privateContent || (privateContent.rooms.length === 0 && privateContent.artworks.length === 0)) {
    return baseContent;
  }

  const roomMap = new Map();
  for (const room of baseContent.rooms) {
    roomMap.set(room.id, room);
  }
  for (const room of privateContent.rooms) {
    roomMap.set(room.id, room);
  }

  const artworkMap = new Map();
  for (const artwork of baseContent.artworks) {
    artworkMap.set(`${artwork.themeId}:${artwork.id}`, artwork);
  }
  for (const artwork of privateContent.artworks) {
    artworkMap.set(`${artwork.themeId}:${artwork.id}`, artwork);
  }

  const rooms = Array.from(roomMap.values()).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const artworks = Array.from(artworkMap.values()).sort((a, b) => {
    const byRoom = (a.themeId || '').localeCompare(b.themeId || '');
    if (byRoom !== 0) {
      return byRoom;
    }
    const bySort = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (bySort !== 0) {
      return bySort;
    }
    return (a.id ?? 0) - (b.id ?? 0);
  });

  return {
    rooms,
    artworks,
    source: `${baseContent.source}+private`,
    privateExpiresAt: privateContent.expiresAt || null
  };
}

async function loadPublicCatalog({
  preferBackend = true,
  backendTimeoutMs = 6000
} = {}) {
  if (preferBackend && isBackendConfigured()) {
    try {
      const payload = await fetchPublicCatalog({ timeoutMs: backendTimeoutMs });
      const rawRooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
      const rawArtworks = Array.isArray(payload?.artworks) ? payload.artworks : [];

      const rooms = normalizeBackendRooms(rawRooms);
      const artworks = normalizeBackendArtworks(rawArtworks, rooms);

      if (rooms.length >= 4 && artworks.length > 0) {
        return {
          rooms,
          artworks,
          source: 'backend'
        };
      }
    } catch (error) {
      console.warn('[contentRepository] backend unavailable, fallback local', error);
    }
  }

  return {
    rooms: ROOMS,
    artworks: normalizeLocalArtworks(ARTWORKS),
    source: 'local-fallback'
  };
}

export function normalizePrivateCatalog(privatePayload) {
  return normalizePrivatePayload(privatePayload);
}

export async function loadMuseumContentWithPrivate({
  preferBackend = true,
  backendTimeoutMs = 6000,
  privatePayload = null
} = {}) {
  const publicContent = await loadPublicCatalog({ preferBackend, backendTimeoutMs });
  const normalizedPrivate = normalizePrivatePayload(privatePayload);
  return mergeCatalogContent(publicContent, normalizedPrivate);
}

export async function loadMuseumContent(options = {}) {
  return loadMuseumContentWithPrivate(options);
}
